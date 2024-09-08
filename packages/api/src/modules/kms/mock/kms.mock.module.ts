import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KmsKey } from '../entities/kms-key.entity';
import { KmsMockService } from './kms.mock.service';

@Module({
  imports: [SequelizeModule.forFeature([KmsKey])],
  providers: [KmsMockService],
  exports: [KmsMockService],
})
export class KmsMockModule {}
