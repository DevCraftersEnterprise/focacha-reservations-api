import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ZonesModule } from './modules/zones/zones.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { SecurityLoggingInterceptor } from './common/interceptors/security-logging.interceptor';
import { PrinterModule } from './modules/printer/printer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNC') === 'true',
        logging: configService.get<string>('DB_LOGGING') === 'true',
        ssl: configService.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    // Security: Rate limiting to prevent brute force attacks
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: configService.get<number>('THROTTLE_SHORT_LIMIT') || 10,
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: configService.get<number>('THROTTLE_MEDIUM_LIMIT') || 20,
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: configService.get<number>('THROTTLE_LONG_LIMIT') || 100,
        },
      ],
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    BranchesModule,
    ZonesModule,
    ReservationsModule,
    PrinterModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Security: Apply throttler guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Security: Apply security logging interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityLoggingInterceptor,
    },
  ],
})
export class AppModule { }
