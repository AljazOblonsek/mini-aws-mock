import { ApiProperty } from '@nestjs/swagger';
import { SqsMessageDto } from './sqs-message.dto';

export class SqsMessageHistoryDto extends SqsMessageDto {
  @ApiProperty()
  deletedAt: Date;
}
