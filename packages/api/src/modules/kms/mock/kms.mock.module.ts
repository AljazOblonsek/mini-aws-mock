import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KmsKey } from '../entities/kms-key.entity';
import { KmsMockService } from './kms.mock.service';
import { KmsEncryptionHistory } from '../entities/kms-encryption-history.entity';

@Module({
  imports: [SequelizeModule.forFeature([KmsKey, KmsEncryptionHistory])],
  providers: [KmsMockService],
  exports: [KmsMockService],
})
export class KmsMockModule {}
