import { Type } from 'class-transformer';
import {
  IsDateString,
  IsString,
  Matches,
  IsInt,
  Min,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  reservationDate: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
    message: 'reservationTime must be in the format HH:mm or HH:mm:ss',
  })
  reservationTime: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount: number;

  @Type(() => String)
  @IsString()
  branchId: string;

  @Type(() => String)
  @IsString()
  zoneId: string;

  @IsString()
  @MaxLength(150)
  eventType: string;

  @IsString()
  @MaxLength(150)
  customerName: string;

  @IsString()
  @MaxLength(20)
  phonePrimary: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneSecondary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
