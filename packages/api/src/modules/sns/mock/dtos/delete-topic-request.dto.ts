import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsString } from 'class-validator';

export class DeleteTopicRequestDto extends AwsRequestBaseDto {
  @IsString()
  TopicArn: string;
}
