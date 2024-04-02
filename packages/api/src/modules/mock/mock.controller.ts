import { Controller, Logger, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { SnsMockService } from '../sns/mock/sns.mock.service';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  AwsRequestType,
  AwsException,
  InvalidActionException,
  InternalFailureException,
  convertAwsExceptionToJson,
  convertAwsExceptionToXml,
  AwsActionOptions,
  verifyV4Signature,
  getServiceNameFromAuthorizationHeader,
  XMLN_MAP,
} from '@/src/common/mock';
import { ConfigService } from '@nestjs/config';
import { SqsMockService } from '../sqs/mock/sqs.mock.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('AWS Mock')
@Controller()
export class MockController {
  private readonly logger: Logger;
  private actionsMap: Record<string, Record<string, (options: AwsActionOptions) => Promise<any>>>;

  constructor(
    private readonly configService: ConfigService,
    snsMockService: SnsMockService,
    sqsMockService: SqsMockService
  ) {
    this.logger = new Logger(this.constructor.name);

    this.actionsMap = {
      sns: { ...snsMockService.getActionsMap() },
      sqs: { ...sqsMockService.getActionsMap() },
    };
  }

  @ApiOperation({
    summary: 'Main entrypoint for AWS SDKs.',
    description:
      'This is the main entrypoint that your AWS SDK will talk to - you will probably never call this endpoint directly.',
  })
  @Post('/')
  async post(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    // Set requestId in request & response
    const requestId = randomUUID();
    req.headers['x-amzn-requestid'] = requestId;
    res.header('x-amzn-requestid', requestId);

    const awsRequestType =
      req.headers['content-type'] === 'application/x-www-form-urlencoded'
        ? AwsRequestType.XmlRequest
        : AwsRequestType.JsonRequest;

    // Get action based on whenever the request is of type XML or JSON
    let action = '';

    if (awsRequestType === AwsRequestType.XmlRequest) {
      action = req.body.Action;
    } else {
      action = (req.headers['x-amz-target'] as string).split('.').at(-1) as string;
    }

    const serviceName = getServiceNameFromAuthorizationHeader(req.headers.authorization!) || '';

    this.logger.log(
      `Received request from AWS SDK - Action: ${action}, Service: ${serviceName} Type: ${awsRequestType}.`
    );
    this.logger.debug(
      { body: req.body, service: serviceName, awsRequestType },
      'Received request from AWS SDK.'
    );

    try {
      verifyV4Signature({ request: req, configService: this.configService, awsRequestType });

      const service = this.actionsMap[serviceName];

      if (!service) {
        this.logger.debug({ serviceName }, `Service "${serviceName}" not found in actions map.`);
        throw new InvalidActionException();
      }

      const handler = service[action];

      if (!handler) {
        this.logger.debug(
          { serviceName, action },
          `Service "${serviceName}" does not have action called "${action}".`
        );
        throw new InvalidActionException();
      }

      const response = await handler({ requestId, type: awsRequestType, body: req.body, req, res });
      return res.status(200).send(response);
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error({ error: err }, 'Throwing AWS error.');
      res.header('content-type', req.headers['content-type']);

      if (err instanceof AwsException) {
        if (awsRequestType === AwsRequestType.XmlRequest) {
          return res.status(err.awsError.httpStatus).send(
            convertAwsExceptionToXml({
              awsException: err,
              requestId: requestId,
              xlmnUrl: XMLN_MAP[serviceName],
            })
          );
        } else {
          return res.status(err.awsError.httpStatus).send(
            convertAwsExceptionToJson({
              awsException: err,
            })
          );
        }
      } else {
        if (awsRequestType === AwsRequestType.XmlRequest) {
          return res.status(500).send(
            convertAwsExceptionToXml({
              awsException: new InternalFailureException(),
              requestId: requestId,
              xlmnUrl: XMLN_MAP[serviceName],
            })
          );
        } else {
          return res.status(500).send(
            convertAwsExceptionToJson({
              awsException: new InternalFailureException(),
            })
          );
        }
      }
    }
  }
}
