import { UsersService } from '@modules/users/users.service';
import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from '@modules/users/entities/user.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            this.logger.warn(`Failed login attempt for non-existent user: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            this.logger.warn(
                `Login attempt for inactive user: ${email} (ID: ${user.id})`,
            );
            throw new ForbiddenException('User account is inactive');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            this.logger.warn(
                `Failed login attempt for user: ${email} (ID: ${user.id}) - Invalid password`,
            );
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.validateUser(email, password);

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            branchId: user.branch?.id,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        this.logger.log(`Successful login for user: ${email} (ID: ${user.id})`);

        return {
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                branchId: user.branch?.id,
                branch: {
                    id: user.branch?.id,
                    name: user.branch?.name,
                },
            },
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            this.logger.warn(`Profile request for non-existent user ID: ${userId}`);
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            branchId: user.branch?.id,
            branch: {
                id: user.branch?.id,
                name: user.branch?.name,
            },
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
