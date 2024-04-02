import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SqsMessageDto {
  @ApiProperty()
  messageId: string;

  @ApiProperty()
  messageBody: string;

  @ApiPropertyOptional()
  messageAttributes?: string;

  @ApiProperty()
  queueUrl: string;

  @ApiProperty()
  isInTransit: boolean;

  @ApiProperty()
  createdAt: Date;
}
