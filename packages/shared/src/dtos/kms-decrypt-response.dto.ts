import { ApiProperty } from '@nestjs/swagger';

export class KmsDecryptResponseDto {
  @ApiProperty({ description: 'Decrypted content in plaintext.' })
  content: string;
}
