import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('protected-admin')
  protectedAdmin(@Req() req: any) {
    return {
      message: 'Only ADMIN can access this route',
      user: req.user
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected-any-auth')
  protectedAnyAuth(@Req() req: any) {
    return {
      message: 'Any authenticated user can access this route',
      user: req.user
    }
  }
}
