import { IsOptional, IsString } from 'class-validator';

export class AwsRequestBaseDto {
  @IsString()
  @IsOptional()
  Action?: string;

  @IsString()
  @IsOptional()
  Version?: string;
}
