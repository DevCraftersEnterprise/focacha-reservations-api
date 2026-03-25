import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { email }
        });
    }

    async findById(id: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { id }
        });
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            where: { deletedAt: IsNull() },
            order: { createdAt: 'DESC' }
        });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {

        const existingUser = await this.findByEmail(createUserDto.email);

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.usersRepository.create({
            ...createUserDto,
            passwordHash: hashedPassword,
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

        if (updateUserDto.password) {
            updateUserDto['passwordHash'] = await bcrypt.hash(updateUserDto.password, 10);
            delete updateUserDto.password;
        }

        Object.assign(user, updateUserDto);

        return await this.usersRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.usersRepository.update(id, { isActive: false });
        await this.usersRepository.softRemove(user);
    }

    async restore(id: string): Promise<void> {
        await this.usersRepository.update(id, { isActive: true });
        await this.usersRepository.restore(id);
    }
}
