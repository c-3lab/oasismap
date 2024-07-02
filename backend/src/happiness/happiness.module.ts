import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessInputService } from './happiness-input.service';
import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import { AuthService } from 'src/auth/auth';
import { HappinessExportService } from './happiness-export.service';
import { HappinessImportService } from './happiness-import.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Happiness } from './happiness.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Happiness])],
  controllers: [HappinessController],
  providers: [
    HappinessInputService,
    HappinessMeService,
    HappinessAllService,
    HappinessExportService,
    HappinessImportService,
    AuthService,
  ],
})
export class HappinessModule {}
