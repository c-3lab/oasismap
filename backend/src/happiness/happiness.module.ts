import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';

@Module({
  controllers: [HappinessController],
  providers: [HappinessMeService, HappinessAllService],
})
export class HappinessModule {}
