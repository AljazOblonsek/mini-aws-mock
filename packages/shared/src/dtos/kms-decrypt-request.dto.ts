import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KmsDecryptRequestDto {
  @ApiProperty({ description: 'Encrypted content in base64 format.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
