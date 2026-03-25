import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

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

    async create(data: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(data);
        return await this.usersRepository.save(user);
    }
}
