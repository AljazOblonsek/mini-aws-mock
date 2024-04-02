import { AwsRequestBaseDto } from '@/src/common/mock';
import { IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SQS_QUEUE_CONSTANTS } from '@mini-aws-mock/shared';

class CreateQueueAttributesDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(SQS_QUEUE_CONSTANTS.MaximumVisibilityTimeoutInSeconds)
  VisibilityTimeout: number = SQS_QUEUE_CONSTANTS.DefaultVisibilityTimeoutInSeconds;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(SQS_QUEUE_CONSTANTS.MaximumReceiveMessageWaitTimeInSeconds)
  ReceiveMessageWaitTimeSeconds: number =
    SQS_QUEUE_CONSTANTS.DefaultReceiveMessageWaitTimeInSeconds;

  @Type(() => Number)
  @IsNumber()
  @Min(SQS_QUEUE_CONSTANTS.MinimumMessageSizeInBytes)
  @Max(SQS_QUEUE_CONSTANTS.MaximumMessageSizeInBytes)
  MaximumMessageSize: number = SQS_QUEUE_CONSTANTS.MaximumMessageSizeInBytes;
}

export class CreateQueueRequestDto extends AwsRequestBaseDto {
  @IsString()
  QueueName: string;

  @Type(() => CreateQueueAttributesDto)
  @ValidateNested()
  Attributes: CreateQueueAttributesDto = new CreateQueueAttributesDto();
}
