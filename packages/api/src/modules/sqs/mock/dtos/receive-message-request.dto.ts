import { AwsRequestBaseDto } from '@/src/common/mock';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReceiveMessageRequestDto extends AwsRequestBaseDto {
  @IsString()
  QueueUrl: string;

  @IsOptional()
  @IsString({ each: true })
  AttributeNames?: string[];

  @IsOptional()
  @IsString({ each: true })
  MessageAttributeNames?: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  MaxNumberOfMessages: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  VisibilityTimeout?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  WaitTimeSeconds?: number;
}
