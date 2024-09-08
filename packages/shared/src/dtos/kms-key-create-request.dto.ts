import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class KmsKeyCreateRequestDto {
  @ApiProperty()
  @Matches(/^[a-z-]+$/)
  @MinLength(2)
  @MaxLength(64)
  @IsNotEmpty()
  alias: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(256)
  description?: string;
}
