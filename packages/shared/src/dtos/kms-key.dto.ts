import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KeySpec, KeyUsage } from '../enums';

export class KmsKeyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  arn: string;

  @ApiProperty()
  alias: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enumName: 'KeySpec', enum: KeySpec })
  keySpec: KeySpec;

  @ApiProperty({ enumName: 'KeyUsage', enum: KeyUsage })
  keyUsage: KeyUsage;

  @ApiProperty()
  encryptionHistoryLength: number;
}
