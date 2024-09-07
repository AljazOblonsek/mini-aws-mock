import { ApiProperty } from '@nestjs/swagger';

export class KmsEncryptDecryptResponseDto {
  @ApiProperty()
  content: string;
}
