import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageAttributeRequestDto } from './message-attribute-request.dto';

export class SqsSendMessageRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  queueUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  messageBody: string;

  @Type(() => Number)
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(900)
  delaySeconds?: number;

  @Type(() => MessageAttributeRequestDto)
  @ValidateNested({ each: true })
  messageAttributes: MessageAttributeRequestDto[];
}
