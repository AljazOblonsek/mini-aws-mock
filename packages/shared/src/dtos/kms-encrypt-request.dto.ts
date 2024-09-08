import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KmsEncryptRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyId: string;

  @ApiProperty({ description: 'Plaintext string of what to encrypt.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
