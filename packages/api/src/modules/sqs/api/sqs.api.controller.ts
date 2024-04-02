import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  SqsMessageDto,
  SqsMessageHistoryDto,
  SqsQueueCreateRequestDto,
  SqsQueueDto,
  SqsSendMessageRequestDto,
} from '@mini-aws-mock/shared';
import { SqsApiService } from './sqs.api.service';

@ApiTags('SQS API')
@Controller('/sqs/queues')
export class SqsApiController {
  constructor(private readonly sqsApiService: SqsApiService) {}

  @Get()
  @ApiOperation({ summary: 'Returns list of all queues.' })
  @ApiOkResponse({ type: SqsQueueDto, isArray: true })
  async getTopics(): Promise<SqsQueueDto[]> {
    return await this.sqsApiService.getQueues();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new queue.' })
  @ApiCreatedResponse({ type: SqsQueueDto })
  @ApiBadRequestResponse({
    description: 'Validation error or queue with same name already exists.',
  })
  async createTopic(@Body() dto: SqsQueueCreateRequestDto): Promise<SqsQueueDto> {
    return await this.sqsApiService.createQueue(dto);
  }

  @Post('/send-message')
  @ApiOperation({ summary: 'Sends a new message to specified queue url.' })
  @ApiCreatedResponse({ type: SqsMessageDto })
  @ApiBadRequestResponse({
    description: 'Validation error.',
  })
  @ApiNotFoundResponse({ description: 'Queue not found by url.' })
  async sendMessage(@Body() dto: SqsSendMessageRequestDto): Promise<SqsMessageDto> {
    return await this.sqsApiService.sendMessage(dto);
  }

  @Delete('/purge/:name')
  @ApiOperation({ summary: 'Purges all messages from queue.' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Queue not found by name.' })
  async purgeQueue(@Param('name') name: string): Promise<void> {
    await this.sqsApiService.purgeQueue(name);
  }

  @Delete('/delete/:name')
  @ApiOperation({ summary: 'Deletes queue along with all of its messages and history.' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Queue not found by name.' })
  async deleteQueue(@Param('name') name: string): Promise<void> {
    await this.sqsApiService.deleteQueue(name);
  }

  @Get('/messages')
  @ApiOperation({ summary: 'Returns list of all messages.' })
  @ApiOkResponse({ type: SqsMessageDto, isArray: true })
  async getMessages(): Promise<SqsMessageDto[]> {
    return await this.sqsApiService.getMessages();
  }

  @Get('/message-history')
  @ApiOperation({ summary: 'Returns whole history of deleted messages.' })
  @ApiOkResponse({ type: SqsMessageHistoryDto, isArray: true })
  async getMessageHistory(): Promise<SqsMessageHistoryDto[]> {
    return await this.sqsApiService.getMessageHistory();
  }
}
