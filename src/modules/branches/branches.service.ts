import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from '@modules/users/users.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { AssignCashiersDto } from './dto/assing-cashier.dto';

@Injectable()
export class BranchesService {

    constructor(
        @InjectRepository(Branch)
        private readonly branchesRepository: Repository<Branch>,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService
    ) { }

    async findById(id: string): Promise<Branch | null> {
        return this.branchesRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: { cashiers: true }
        });
    }

    async findAll(): Promise<Branch[]> {
        return this.branchesRepository.find({
            where: { deletedAt: IsNull() },
            relations: { cashiers: true },
            order: { createdAt: 'DESC' }
        });
    }

    async create(createBranchDto: CreateBranchDto): Promise<Branch> {
        const existing = await this.branchesRepository.findOne({
            where: {
                name: createBranchDto.name,
                deletedAt: IsNull()
            }
        });

        if (existing) {
            throw new ConflictException('Branch with this name already exists');
        }

        const branch = this.branchesRepository.create({
            ...createBranchDto
        });

        return await this.branchesRepository.save(branch);
    }

    async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
        const branch = await this.findById(id);

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        if (updateBranchDto.name && updateBranchDto.name !== branch.name) {
            const existing = await this.branchesRepository.findOne({
                where: {
                    name: updateBranchDto.name,
                    deletedAt: IsNull()
                }
            });

            if (existing) {
                throw new ConflictException('Branch with this name already exists');
            }
        }

        Object.assign(branch, updateBranchDto);

        return await this.branchesRepository.save(branch);
    }

    async assignCashiers(id: string, dto: AssignCashiersDto) {
        const branch = await this.findById(id);

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        const assignedUsers = await this.usersService.assignBranchToCashiers(
            branch.id,
            dto.cashierIds
        );

        return {
            message: 'Cashiers assigned successfully',
            branchId: branch.id,
            cashierIds: assignedUsers.map(u => u.id)
        }
    }

    async remove(id: string): Promise<void> {
        const branch = await this.findById(id);

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        await this.branchesRepository.softRemove(branch);
    }

    async restore(id: string): Promise<void> {
        await this.branchesRepository.restore(id);
    }
}
