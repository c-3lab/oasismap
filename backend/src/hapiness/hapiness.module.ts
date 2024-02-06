import { Module } from '@nestjs/common';
import { HapinessController } from './hapiness.controller';
import { HapinessService } from './hapiness.service';

@Module({
  controllers: [HapinessController],
  providers: [HapinessService],
})
export class HapinessModule {}
