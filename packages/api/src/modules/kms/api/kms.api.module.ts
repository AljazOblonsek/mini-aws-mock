import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KmsKey } from '../entities/kms-key.entity';
import { KmsApiController } from './kms.api.controller';
import { KmsApiService } from './kms.api.service';

@Module({
  imports: [SequelizeModule.forFeature([KmsKey])],
  controllers: [KmsApiController],
  providers: [KmsApiService],
})
export class KmsApiModule {}
