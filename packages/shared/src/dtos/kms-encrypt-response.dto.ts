import { ApiProperty } from '@nestjs/swagger';

export class KmsEncryptResponseDto {
  @ApiProperty({ description: 'Encrypted content in base64 format.' })
  content: string;
}
