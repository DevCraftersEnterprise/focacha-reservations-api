import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateZoneDto {
    @IsString()
    @MaxLength(120)
    name: string;

    @Type(() => String)
    @IsString()
    branchId: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    capacity?: number;
}
