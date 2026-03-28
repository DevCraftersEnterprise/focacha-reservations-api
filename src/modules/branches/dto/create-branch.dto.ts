import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;
}
