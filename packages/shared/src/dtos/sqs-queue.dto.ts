import { ApiProperty } from '@nestjs/swagger';

export class SqsQueueDto {
  @ApiProperty()
  arn: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  visibilityTimeout: number;

  @ApiProperty()
  receiveMessageWaitTimeSeconds: number;

  @ApiProperty()
  maximumMessageSize: number;

  @ApiProperty()
  numberOfMessages: number;

  @ApiProperty()
  numberOfMessagesInHistory: number;
}
