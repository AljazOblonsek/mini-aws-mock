import { ApiProperty } from '@nestjs/swagger';

export class SnsTopicDto {
  @ApiProperty()
  arn: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  numberOfPublishes: number;
}
