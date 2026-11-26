import { Module } from '@nestjs/common';
import { ChangeHistoriesController } from './change-histories.controller';
import { ChangeHistoriesService } from './change-histories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Happiness } from './happiness.entity';
import {
  ORION_NOTIFY_SECRET,
  loadOrionNotifySecret,
} from './guards/orion-notify-secret';
import { OrionNotifyTokenGuard } from './guards/orion-notify-token.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Happiness])],
  controllers: [ChangeHistoriesController],
  providers: [
    ChangeHistoriesService,
    // モジュール初期化時に評価されるため、シークレットが不正なら backend は起動しない
    {
      provide: ORION_NOTIFY_SECRET,
      useFactory: () => loadOrionNotifySecret(process.env.ORION_NOTIFY_SECRET),
    },
    OrionNotifyTokenGuard,
  ],
  exports: [ChangeHistoriesService],
})
export class ChangeHistoriesModule {}
