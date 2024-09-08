import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsString } from 'class-validator';

export class EncryptRequestDto extends AwsRequestBaseDto {
  @IsString()
  KeyId: string;

  @IsString()
  Plaintext: string;
}
