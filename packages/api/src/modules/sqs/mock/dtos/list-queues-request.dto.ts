import { AwsListRequestDto } from '@/src/common/mock';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ListQueuesRequestDto extends AwsListRequestDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  MaxResults?: number;

  @IsOptional()
  @IsString()
  QueueNamePrefix?: string;
}
