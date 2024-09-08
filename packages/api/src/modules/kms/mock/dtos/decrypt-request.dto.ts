import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsOptional, IsString } from 'class-validator';

export class DecryptRequestDto extends AwsRequestBaseDto {
  @IsString()
  @IsOptional()
  KeyId?: string;

  @IsString()
  CiphertextBlob: string;
}
