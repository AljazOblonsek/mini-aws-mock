import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsString } from 'class-validator';

export class GetQueueUrlRequestDto extends AwsRequestBaseDto {
  @IsString()
  QueueName: string;
}
