import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Req, ParseUUIDPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { FindReservationsDto } from './dto/find-reservations.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.CASHIER)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Get()
  findAll(@Query() filters: FindReservationsDto, @Req() req: any) {
    return this.reservationsService.findAll(filters, req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.reservationsService.findOneForUser(id, req.user.userId, req.user.role);
  }

  @Post()
  create(@Body() dto: CreateReservationDto, @Req() req: any) {
    return this.reservationsService.create(dto, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReservationDto, @Req() req: any) {
    return this.reservationsService.update(id, dto, req.user.userId, req.user.role);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelReservationDto, @Req() req: any) {
    return this.reservationsService.cancel(id, dto, req.user.userId, req.user.role);
  }
}
