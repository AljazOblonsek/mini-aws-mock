import {
  AwsRequestBaseDto,
  IsMessageAttributeRecord,
  MessageAttributeValueDto,
} from '@/src/common/mock';
import { IsOptional, IsString } from 'class-validator';

export class PublishRequestDto extends AwsRequestBaseDto {
  @IsString()
  @IsOptional()
  Message?: string;

  @IsOptional()
  @IsMessageAttributeRecord()
  MessageAttributes?: Record<string, MessageAttributeValueDto>;

  @IsString()
  @IsOptional()
  MessageDeduplicationId?: string;

  @IsString()
  @IsOptional()
  MessageGroupId?: string;

  @IsString()
  @IsOptional()
  MessageStructure?: string;

  @IsString()
  @IsOptional()
  PhoneNumber?: string;

  @IsString()
  @IsOptional()
  Subject?: string;

  @IsString()
  @IsOptional()
  TargetArn?: string;

  @IsString()
  @IsOptional()
  TopicArn?: string;
}
