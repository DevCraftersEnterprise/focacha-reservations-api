import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Security: Strict rate limiting for login endpoint (5 attempts per minute)
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req: any) {
        return await this.authService.getProfile(req.user.userId);
    }
}
