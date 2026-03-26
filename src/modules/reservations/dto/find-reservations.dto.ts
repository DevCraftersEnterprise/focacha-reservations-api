import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';

export class FindReservationsDto {
    @IsOptional()
    @Type(() => String)
    @IsString()
    branchId?: string;

    @IsOptional()
    @IsDateString()
    reservationDate?: string;

    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;
}