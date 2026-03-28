import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelReservationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
