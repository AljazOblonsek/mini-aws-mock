import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EncryptDecryptAction } from '../enums/encrypt-decrypt-action.enum';

export class KmsEncryptDecryptRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyId: string;

  @ApiProperty({ enumName: 'EncryptDecryptAction', enum: EncryptDecryptAction })
  @IsEnum(EncryptDecryptAction)
  action: EncryptDecryptAction;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
