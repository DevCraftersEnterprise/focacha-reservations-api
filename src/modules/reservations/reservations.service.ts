import { BranchesService } from '@modules/branches/branches.service';
import { UsersService } from '@modules/users/users.service';
import { ZonesService } from '@modules/zones/zones.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from '@common/enums/reservation-status.enum';
import { Role } from '@common/enums/role.enum';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { FindReservationsDto } from './dto/find-reservations.dto';
import { ReservationsCalendarDto } from './dto/reservations-calendar.dto';
import { ReservationsDayDetailDto } from './dto/reservations-day-detail.dto';
import { PrinterService } from '@modules/printer/printer.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    private readonly branchesService: BranchesService,
    private readonly zonesService: ZonesService,
    private readonly usersService: UsersService,
    private readonly printersService: PrinterService
  ) { }

  private normalizeTime(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }

  private async valideBranchAndZone(branchId: string, zoneId: string) {
    const branch = await this.branchesService.findById(branchId);

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const zone = await this.zonesService.findByIdAndBranchId(zoneId, branchId);

    if (!zone) {
      throw new NotFoundException('Zone not found in the specified branch');
    }

    if (!zone.isActive) {
      throw new ConflictException('Zone is not active');
    }

    return { branch, zone };
  }

  private async assertReservationSlotAvailable(
    reservationDate: string,
    reservationTime: string,
    branchId: string,
    zoneId: string,
    ignoreReservationId?: string,
  ) {
    const qb = this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.reservationDate = :reservationDate', {
        reservationDate,
      })
      .andWhere('reservation.reservationTime = :reservationTime', {
        reservationTime,
      })
      .andWhere('reservation.branchId = :branchId', { branchId })
      .andWhere('reservation.zoneId = :zoneId', { zoneId })
      .andWhere('reservation.status = :status', {
        status: ReservationStatus.ACTIVE,
      });

    if (ignoreReservationId) {
      qb.andWhere('reservation.id != :ignoreReservationId', {
        ignoreReservationId,
      });
    }

    const existing = await qb.getOne();

    if (existing) {
      throw new ConflictException(
        'The selected time slot is already reserved for the specified branch and zone',
      );
    }
  }

  private async resolveBranchIdByRole(
    authenticatedUserId: string,
    authenticatedUserRole: Role,
    requestedBranchId: string,
  ): Promise<string> {
    if (authenticatedUserRole === Role.ADMIN) {
      return requestedBranchId;
    }

    const user = await this.usersService.findById(authenticatedUserId);

    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    if (!user.branchId) {
      throw new ForbiddenException(
        'Authenticated user is not associated with any branch',
      );
    }

    if (requestedBranchId !== user.branchId) {
      throw new ForbiddenException(
        'Authenticated user does not have access to the requested branch',
      );
    }

    return user.branchId;
  }

  private async assertBranchAccess(
    authenticatedUserId: string,
    authenticatedUserRole: Role,
    branchId: string,
  ): Promise<void> {
    await this.resolveBranchIdByRole(
      authenticatedUserId,
      authenticatedUserRole,
      branchId,
    );
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.reservationsRepository.findOne({
      where: { id },
      relations: {
        branch: true,
        zone: true,
        createdByUser: true,
        updatedByUser: true,
        cancelledByUser: true,
      },
    });
  }

  async findOneForUser(
    id: string,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservación no encontrada');
    }

    await this.resolveBranchIdByRole(
      authenticatedUserId,
      authenticatedUserRole,
      reservation.branchId,
    );

    return reservation;
  }

  async getCalendarSummary(
    dto: ReservationsCalendarDto,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ) {
    await this.assertBranchAccess(
      authenticatedUserId,
      authenticatedUserRole,
      dto.branchId,
    );

    const month = dto.month.toString().padStart(2, '0');
    const startDate = `${dto.year}-${month}-01`;

    const nextMonthDate = new Date(dto.year, dto.month, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextMonthDate.getDate()).padStart(2, '0');
    const endDateExclusive = `${nextYear}-${nextMonth}-${nextDay}`;

    const raw = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .select('reservation.reservationDate', 'date')
      .addSelect('COUNT(reservation.id)', 'count')
      .where('reservation.branchId = :branchId', { branchId: dto.branchId })
      .andWhere('reservation.reservationDate >= :startDate', { startDate })
      .andWhere('reservation.reservationDate < :endDateExclusive', {
        endDateExclusive,
      })
      .andWhere('reservation.status = :status', {
        status: ReservationStatus.ACTIVE,
      })
      .groupBy('reservation.reservationDate')
      .orderBy('reservation.reservationDate', 'ASC')
      .getRawMany();

    return raw.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));
  }

  async getDayDetail(
    dto: ReservationsDayDetailDto,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ) {
    await this.assertBranchAccess(
      authenticatedUserId,
      authenticatedUserRole,
      dto.branchId,
    );

    const items = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.branch', 'branch')
      .leftJoinAndSelect('reservation.zone', 'zone')
      .leftJoinAndSelect('reservation.createdByUser', 'createdByUser')
      .leftJoinAndSelect('reservation.updatedByUser', 'updatedByUser')
      .leftJoinAndSelect('reservation.cancelledByUser', 'cancelledByUser')
      .where('reservation.branchId = :branchId', { branchId: dto.branchId })
      .andWhere('reservation.reservationDate = :date', { date: dto.date })
      .orderBy('reservation.reservationTime', 'ASC')
      .getMany();

    return {
      date: dto.date,
      branchId: dto.branchId,
      total: items.length,
      activeCount: items.filter(
        (item) => item.status === ReservationStatus.ACTIVE,
      ).length,
      cancelledCount: items.filter(
        (item) => item.status === ReservationStatus.CANCELLED,
      ).length,
      items,
    };
  }

  async create(
    dto: CreateReservationDto,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ): Promise<Reservation> {
    const branchId = await this.resolveBranchIdByRole(
      authenticatedUserId,
      authenticatedUserRole,
      dto.branchId,
    );

    const normalizedTime = this.normalizeTime(dto.reservationTime);

    await this.valideBranchAndZone(branchId, dto.zoneId);
    await this.assertReservationSlotAvailable(
      dto.reservationDate,
      normalizedTime,
      branchId,
      dto.zoneId,
    );

    const reservation = this.reservationsRepository.create({
      reservationDate: dto.reservationDate,
      reservationTime: normalizedTime,
      guestCount: dto.guestCount,
      branchId,
      zoneId: dto.zoneId,
      eventType: dto.eventType,
      customerName: dto.customerName,
      phonePrimary: dto.phonePrimary,
      phoneSecondary: dto.phoneSecondary ?? null,
      notes: dto.notes ?? null,
      createdByUserId: authenticatedUserId,
      updatedByUserId: null,
      cancelledAt: null,
      cancellationReason: null,
      cancelledByUserId: null,
    });

    return await this.reservationsRepository.save(reservation);
  }

  async update(
    id: string,
    dto: UpdateReservationDto,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('Cannot update a cancelled reservation');
    }

    const targetBranchId = dto.branchId ?? reservation.branchId;

    await this.resolveBranchIdByRole(
      authenticatedUserId,
      authenticatedUserRole,
      targetBranchId,
    );

    const targetZoneId = dto.zoneId ?? reservation.zoneId;
    const targetDate = dto.reservationDate ?? reservation.reservationDate;
    const targetTime = this.normalizeTime(
      dto.reservationTime ?? reservation.reservationTime,
    );

    await this.valideBranchAndZone(targetBranchId, targetZoneId);
    await this.assertReservationSlotAvailable(
      targetDate,
      targetTime,
      targetBranchId,
      targetZoneId,
      reservation.id,
    );

    Object.assign(reservation, {
      ...dto,
      updatedByUserId: authenticatedUserId,
    });

    return await this.reservationsRepository.save(reservation);
  }

  async cancel(
    id: string,
    dto: CancelReservationDto,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    await this.resolveBranchIdByRole(
      authenticatedUserId,
      authenticatedUserRole,
      reservation.branchId,
    );

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('Reservation is already cancelled');
    }

    Object.assign(reservation, {
      cancellationReason: dto.reason ?? null,
      cancelledAt: new Date(),
      status: ReservationStatus.CANCELLED,
      cancelledByUserId: authenticatedUserId,
      updatedByUserId: authenticatedUserId,
    });

    return await this.reservationsRepository.save(reservation);
  }

  async findAll(
    filters: FindReservationsDto,
    authenticatedUserId: string,
    authenticatedUserRole: Role,
  ): Promise<Reservation[]> {
    const qb = this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.branch', 'branch')
      .leftJoinAndSelect('reservation.zone', 'zone')
      .leftJoinAndSelect('reservation.createdByUser', 'createdByUser')
      .leftJoinAndSelect('reservation.updatedByUser', 'updatedByUser')
      .leftJoinAndSelect('reservation.cancelledByUser', 'cancelledByUser')
      .orderBy('reservation.reservationDate', 'ASC')
      .addOrderBy('reservation.reservationTime', 'ASC');

    if (authenticatedUserRole === Role.CASHIER) {
      const user = await this.usersService.findById(authenticatedUserId);

      if (!user) {
        throw new NotFoundException('Authenticated user not found');
      }

      if (!user.branchId) {
        throw new ForbiddenException(
          'Authenticated user is not associated with any branch',
        );
      }

      qb.andWhere('reservation.branchId = :branchId', {
        branchId: user.branchId,
      });
    } else if (filters.branchId) {
      qb.andWhere('reservation.branchId = :branchId', {
        branchId: filters.branchId,
      });
    }

    if (filters.reservationDate) {
      qb.andWhere('reservation.reservationDate = :reservationDate', {
        reservationDate: filters.reservationDate,
      });
    }

    if (filters.status) {
      qb.andWhere('reservation.status = :status', { status: filters.status });
    }

    return await qb.getMany();
  }

  async createReservationDocument(reservationId: string): Promise<PDFKit.PDFDocument> {
    const reservation = await this.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Formatear la fecha
    const reservationDate = new Date(reservation.reservationDate);
    const formatter = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
    const formattedDate = formatter.format(reservationDate);

    // Formatear la hora (de formato 24h a 12h con am/pm)
    const [hours, minutes] = reservation.reservationTime.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const formattedTime = `${hour12}:${minutes}${period}`;

    const doc = this.printersService.createReservationPdf({
      customerName: reservation.customerName,
      guestCount: reservation.guestCount,
      zoneName: reservation.zone.name,
      formattedDate,
      formattedTime,
    });

    return doc;
  }
}
