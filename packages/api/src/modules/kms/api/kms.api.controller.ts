import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KmsApiService } from './kms.api.service';
import {
  KmsDecryptRequestDto,
  KmsDecryptResponseDto,
  KmsEncryptRequestDto,
  KmsEncryptResponseDto,
  KmsKeyCreateRequestDto,
  KmsKeyDto,
} from '@mini-aws-mock/shared';

@ApiTags('KMS API')
@Controller('/kms/keys')
export class KmsApiController {
  constructor(private readonly kmsApiService: KmsApiService) {}

  @Get()
  @ApiOperation({ summary: 'Returns list of all keys.' })
  @ApiOkResponse({ type: KmsKeyDto, isArray: true })
  async getKeys(): Promise<KmsKeyDto[]> {
    return await this.kmsApiService.getKeys();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new key.' })
  @ApiCreatedResponse({ type: KmsApiService })
  @ApiBadRequestResponse({
    description: 'Validation error or key with same alias already exists.',
  })
  async createKey(@Body() dto: KmsKeyCreateRequestDto): Promise<KmsKeyDto> {
    return await this.kmsApiService.createKey(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a key.' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Topic not found by arn.' })
  async deleteKey(@Param('id') id: string): Promise<void> {
    await this.kmsApiService.deleteKey(id);
  }

  @Post('encrypt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypts the given content and returns it in base64 format.' })
  @ApiOkResponse({ type: KmsEncryptResponseDto })
  async encrypt(@Body() dto: KmsEncryptRequestDto): Promise<KmsEncryptResponseDto> {
    return await this.kmsApiService.encrypt(dto);
  }

  @Post('decrypt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Takes content in base64 format and attemps to decrypt it.' })
  @ApiOkResponse({ type: KmsDecryptResponseDto })
  async decrypt(@Body() dto: KmsDecryptRequestDto): Promise<KmsDecryptResponseDto> {
    return await this.kmsApiService.decrypt(dto);
  }
}
