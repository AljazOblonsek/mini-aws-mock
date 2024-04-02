import { IsOptional, IsString } from 'class-validator';

export class MessageAttributeValueDto {
  @IsString()
  DataType: string;

  @IsOptional()
  @IsString()
  StringValue?: string;

  @IsOptional()
  BinaryValue?: unknown;
}
