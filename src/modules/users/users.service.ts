import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, IsNull, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { BranchesService } from '@modules/branches/branches.service';
import { Role } from '@common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => BranchesService))
    private readonly branchesService: BranchesService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
      relations: { branch: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { branch: true },
    });
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];

    return this.usersRepository.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
      relations: ['branch'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      where: { deletedAt: IsNull() },
      relations: { branch: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findCashiersByBranchId(branchId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        branchId,
        role: Role.CASHIER,
        deletedAt: IsNull(),
      },
      relations: { branch: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    if (createUserDto.role === Role.ADMIN) {
      createUserDto.branchId = undefined;
    }

    if (createUserDto.role === Role.CASHIER && createUserDto.branchId) {
      const branch = await this.branchesService.findById(
        createUserDto.branchId,
      );

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
      branchId:
        createUserDto.role === Role.CASHIER
          ? (createUserDto.branchId ?? null)
          : null,
    });

    return await this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateUserDto.role === Role.ADMIN) {
      updateUserDto.branchId = undefined;
    }

    if (
      updateUserDto.role === Role.CASHIER &&
      updateUserDto.branchId !== undefined &&
      updateUserDto.branchId !== null
    ) {
      const branch = await this.branchesService.findById(
        updateUserDto.branchId,
      );

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, {
      ...updateUserDto,
    });

    return await this.usersRepository.save(updatedUser.raw);
  }

  async syncBranchCashiers(
    branchId: string,
    cashierIds: string[],
  ): Promise<{
    assigned: User[];
    unassigned: User[];
  }> {
    const branch = await this.branchesService.findById(branchId);

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const uniqueIds = [...new Set(cashierIds)];
    const targetCashiers = await this.findByIds(uniqueIds);

    if (targetCashiers.length !== uniqueIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    const invalidUsers = targetCashiers.filter(
      (user) => user.role !== Role.CASHIER,
    );

    if (invalidUsers.length > 0) {
      throw new ConflictException('All users must have the CASHIER role');
    }

    const currentCashiers = await this.findCashiersByBranchId(branchId);

    const currentIds = new Set(currentCashiers.map((user) => user.id));
    const targetIds = new Set(uniqueIds);

    const usersToUnassign = currentCashiers.filter(
      (user) => !targetIds.has(user.id),
    );
    const usersToAssignOrKeep = targetCashiers;

    for (const user of usersToUnassign) {
      user.branchId = null;
      user.branch = null;
    }

    for (const user of usersToAssignOrKeep) {
      user.branchId = branch.id;
      user.branch = branch;
    }

    const usersToSave = [...usersToUnassign, ...usersToAssignOrKeep];

    if (usersToSave.length > 0) {
      await this.usersRepository.save(usersToSave);
    }

    return {
      assigned: usersToAssignOrKeep,
      unassigned: usersToUnassign,
    };
  }

  async unassignCashier(userId: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.CASHIER) {
      throw new ConflictException('User must have the CASHIER role');
    }

    user.branchId = null;

    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.softRemove(user);
  }

  async restore(id: string): Promise<void> {
    await this.usersRepository.restore(id);
  }
}
