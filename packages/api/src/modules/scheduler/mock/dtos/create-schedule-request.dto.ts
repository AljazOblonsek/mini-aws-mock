import { AwsRequestBaseDto } from '@/src/common/mock';
import { FlexibleTimeWindowMode } from '@mini-aws-mock/shared';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';

class CreateScheduleFlexibleTimeWindowDto {
  @IsEnum(FlexibleTimeWindowMode)
  Mode: FlexibleTimeWindowMode;
}

class CreateScheduleTargetDto {
  @IsString()
  Arn: string;

  @IsString()
  RoleArn: string;
}

export class CreateScheduleRequestDto extends AwsRequestBaseDto {
  @IsString()
  ScheduleExpression: string;

  @Type(() => CreateScheduleFlexibleTimeWindowDto)
  @ValidateNested()
  FlexibleTimeWindow: CreateScheduleFlexibleTimeWindowDto;

  @Type(() => CreateScheduleTargetDto)
  @ValidateNested()
  Target: CreateScheduleTargetDto;
}
