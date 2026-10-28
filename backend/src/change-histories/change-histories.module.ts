import { Module } from '@nestjs/common';
import { ChangeHistoriesController } from './change-histories.controller';
import { ChangeHistoriesService } from './change-histories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Happiness } from './happiness.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Happiness])],
  controllers: [ChangeHistoriesController],
  providers: [ChangeHistoriesService],
  exports: [ChangeHistoriesService],
})
export class ChangeHistoriesModule {}
