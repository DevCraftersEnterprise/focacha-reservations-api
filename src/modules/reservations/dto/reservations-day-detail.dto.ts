import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsString } from 'class-validator';

export class ReservationsDayDetailDto {
    @Type(() => String)
    @IsString()
    branchId: string;

    @IsDateString()
    date: string;
}