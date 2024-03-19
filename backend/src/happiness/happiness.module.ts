import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessInputService } from './happiness-input.service';
import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import { AuthService } from 'src/auth/auth';

@Module({
  controllers: [HappinessController],
  providers: [
    HappinessInputService,
    HappinessMeService,
    HappinessAllService,
    AuthService,
  ],
})
export class HappinessModule {}
