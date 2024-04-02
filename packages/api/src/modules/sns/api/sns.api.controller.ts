import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SnsApiService } from './sns.api.service';
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
  SnsTopicCreateRequestDto,
  SnsTopicDto,
  SnsTopicPublishHistoryDto,
} from '@mini-aws-mock/shared';

@ApiTags('SNS API')
@Controller('/sns/topics')
export class SnsApiController {
  constructor(private readonly snsApiService: SnsApiService) {}

  @Get()
  @ApiOperation({ summary: 'Returns list of all topics.' })
  @ApiOkResponse({ type: SnsTopicDto, isArray: true })
  async getTopics(): Promise<SnsTopicDto[]> {
    return await this.snsApiService.getTopics();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new topic.' })
  @ApiCreatedResponse({ type: SnsTopicDto })
  @ApiBadRequestResponse({
    description: 'Validation error or topic with same name already exists.',
  })
  async createTopic(@Body() dto: SnsTopicCreateRequestDto): Promise<SnsTopicDto> {
    return await this.snsApiService.createTopic(dto);
  }

  @Delete(':arn')
  @ApiOperation({ summary: 'Deletes a topic.' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Topic not found by arn.' })
  async deleteTopic(@Param('arn') arn: string): Promise<void> {
    await this.snsApiService.deleteTopic(arn);
  }

  @Get('/publish-history')
  @ApiOperation({ summary: 'Returns full publish history.' })
  @ApiOkResponse({ type: SnsTopicCreateRequestDto, isArray: true })
  async getPublishHistory(): Promise<SnsTopicPublishHistoryDto[]> {
    return await this.snsApiService.getPublishHistory();
  }

  @Delete('/publish-history/purge')
  @ApiOperation({ summary: 'Purges whole publish history.' })
  @ApiNoContentResponse()
  async purgePublishHistory(): Promise<void> {
    return await this.snsApiService.purgePublishHistory();
  }
}
