import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KmsKey } from '../entities/kms-key.entity';
import { KmsApiController } from './kms.api.controller';
import { KmsApiService } from './kms.api.service';
import { KmsEncryptionHistory } from '../entities/kms-encryption-history.entity';

@Module({
  imports: [SequelizeModule.forFeature([KmsKey, KmsEncryptionHistory])],
  controllers: [KmsApiController],
  providers: [KmsApiService],
})
export class KmsApiModule {}
