import {
  AwsRequestBaseDto,
  IsMessageAttributeRecord,
  MessageAttributeValueDto,
} from '@/src/common/mock';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SendMessageRequestDto extends AwsRequestBaseDto {
  @IsString()
  QueueUrl: string;

  @IsString()
  MessageBody: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  DelaySeconds?: number;

  @IsOptional()
  @IsMessageAttributeRecord()
  MessageAttributes?: Record<string, MessageAttributeValueDto>;
}
