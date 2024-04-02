import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsString } from 'class-validator';

export class DeleteMessageRequestDto extends AwsRequestBaseDto {
  @IsString()
  QueueUrl: string;

  @IsString()
  ReceiptHandle: string;
}
