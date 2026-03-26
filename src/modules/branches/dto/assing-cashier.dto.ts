import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class AssignCashiersDto {
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => String)
    @IsString({ each: true })
    cashierIds: string[];
}