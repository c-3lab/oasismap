import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessService } from './happiness.service';

@Module({
  controllers: [HappinessController],
  providers: [HappinessService],
})
export class HappinessModule {}
