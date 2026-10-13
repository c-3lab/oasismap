import { Module } from '@nestjs/common';
import { HappinessController } from './happiness.controller';
import { HappinessInputService } from './happiness-input.service';
import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import { HappinessListService } from './happiness-list.service';
import { AuthService } from 'src/auth/auth';
import { HappinessExportService } from './happiness-export.service';
import { HappinessImportService } from './happiness-import.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Happiness } from '../change-histories/happiness.entity';
import { HappinessDeleteService } from './happiness-delete.service';
import { ChangeHistoriesModule } from 'src/change-histories/change-histories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Happiness]), ChangeHistoriesModule],
  controllers: [HappinessController],
  providers: [
    HappinessInputService,
    HappinessDeleteService,
    HappinessMeService,
    HappinessAllService,
    HappinessListService,
    HappinessExportService,
    HappinessImportService,
    AuthService,
  ],
})
export class HappinessModule {}
