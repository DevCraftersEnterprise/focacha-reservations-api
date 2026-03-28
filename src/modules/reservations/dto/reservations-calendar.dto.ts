import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class ReservationsCalendarDto {
  @Type(() => String)
  @IsString()
  branchId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}
