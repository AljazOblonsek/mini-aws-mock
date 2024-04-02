import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageAttributeRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  value: string;
}
