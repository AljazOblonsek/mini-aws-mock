import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsString } from 'class-validator';

export class CreateTopicRequestDto extends AwsRequestBaseDto {
  @IsString()
  Name: string;
}
