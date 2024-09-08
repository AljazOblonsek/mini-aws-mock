import { ApiProperty } from '@nestjs/swagger';
import { EncryptionAction, EncryptionKind } from '../enums';

export class KmsEncryptionHistoryDto {
  @ApiProperty({ enumName: 'EncryptionAction', enum: EncryptionAction })
  encryptionAction: EncryptionAction;

  @ApiProperty({ enumName: 'EncryptionKind', enum: EncryptionKind })
  encryptionKind: EncryptionKind;

  @ApiProperty({ description: 'String in base64 format.' })
  input: string;

  @ApiProperty({ description: 'String in base64 format.' })
  output: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  keyId: string;

  @ApiProperty()
  keyAlias: string;
}
