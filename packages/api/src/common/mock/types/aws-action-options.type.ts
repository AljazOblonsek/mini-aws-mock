import { Request, Response } from 'express';
import { AwsRequestType } from '../enums/aws-request-type.enum';

export type AwsActionOptions = {
  requestId: string;
  body: Record<string, unknown>;
  type: AwsRequestType;
  req: Request;
  res: Response;
};
