import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessService } from './happiness.service';
import { AuthService } from 'src/auth/auth';
import { HappinessExportService } from './happiness-export.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Happiness } from './happiness.entity';
import { HappinessAllService } from './happiness-all.service';

@Module({
  imports: [TypeOrmModule.forFeature([Happiness])],
  controllers: [HappinessController],
  providers: [
    HappinessService,
    HappinessAllService,
    HappinessExportService,
    AuthService,
  ],
})
export class HappinessModule {}
