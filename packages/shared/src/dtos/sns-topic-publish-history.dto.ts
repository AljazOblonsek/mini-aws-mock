import { ApiProperty } from '@nestjs/swagger';

export class SnsTopicPublishHistoryDto {
  @ApiProperty()
  topicArn: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ nullable: true })
  messageAttributes?: string;

  @ApiProperty()
  messageId: string;

  @ApiProperty()
  createdAt: Date;
}
