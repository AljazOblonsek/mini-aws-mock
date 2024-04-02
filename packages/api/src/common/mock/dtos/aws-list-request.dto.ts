import { IsOptional, IsString } from 'class-validator';
import { AwsRequestBaseDto } from './aws-request-base.dto';

export class AwsListRequestDto extends AwsRequestBaseDto {
  @IsOptional()
  @IsString()
  NextToken?: string;
}
