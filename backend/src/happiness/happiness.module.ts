import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessService } from './happiness.service';
import { AuthService } from 'src/auth/auth';

@Module({
  controllers: [HappinessController],
  providers: [HappinessService, AuthService],
})
export class HappinessModule {}
