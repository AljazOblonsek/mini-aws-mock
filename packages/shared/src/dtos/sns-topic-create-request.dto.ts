import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SnsTopicCreateRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
