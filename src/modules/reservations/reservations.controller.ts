import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { RolesGuard } from '@common/guards/roles.guard';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsDto } from './dto/find-reservations.dto';
import { ReservationsCalendarDto } from './dto/reservations-calendar.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';
import { ReservationsDayDetailDto } from './dto/reservations-day-detail.dto';
import type { Response } from 'express';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.CASHIER)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Get()
  findAll(@Query() filters: FindReservationsDto, @Req() req: any) {
    return this.reservationsService.findAll(
      filters,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('calendar/summary')
  getCalendarSummary(@Query() dto: ReservationsCalendarDto, @Req() req: any) {
    return this.reservationsService.getCalendarSummary(
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  @Get('day-detail')
  getDayDetail(@Query() dto: ReservationsDayDetailDto, @Req() req: any) {
    return this.reservationsService.getDayDetail(
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  @Get(':id/document')
  async getDocument(
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const pdfDoc = await this.reservationsService.createReservationDocument(id);

    response.setHeader('Content-Type', 'application/pdf');

    pdfDoc.pipe(response);
    pdfDoc.end();
  }


  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.reservationsService.findOneForUser(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  @Post()
  create(@Body() dto: CreateReservationDto, @Req() req: any) {
    return this.reservationsService.create(dto, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
    @Req() req: any,
  ) {
    return this.reservationsService.update(
      id,
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelReservationDto,
    @Req() req: any,
  ) {
    return this.reservationsService.cancel(
      id,
      dto,
      req.user.userId,
      req.user.role,
    );
  }
}
