import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsString } from 'class-validator';

export class DeleteQueueRequestDto extends AwsRequestBaseDto {
  @IsString()
  QueueUrl: string;
}
