import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SQS_QUEUE_CONSTANTS } from '../constants/sqs-queue.constants';

export class SqsQueueCreateRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(SQS_QUEUE_CONSTANTS.MaximumVisibilityTimeoutInSeconds)
  visibilityTimeout: number = SQS_QUEUE_CONSTANTS.DefaultVisibilityTimeoutInSeconds;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(SQS_QUEUE_CONSTANTS.MaximumReceiveMessageWaitTimeInSeconds)
  receiveMessageWaitTimeSeconds: number =
    SQS_QUEUE_CONSTANTS.DefaultReceiveMessageWaitTimeInSeconds;

  @Type(() => Number)
  @IsNumber()
  @Min(SQS_QUEUE_CONSTANTS.MinimumMessageSizeInBytes)
  @Max(SQS_QUEUE_CONSTANTS.MaximumMessageSizeInBytes)
  maximumMessageSize: number = SQS_QUEUE_CONSTANTS.MaximumMessageSizeInBytes;
}
