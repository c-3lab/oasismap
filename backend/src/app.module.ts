import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HappinessModule } from './happiness/happiness.module';

@Module({
  imports: [HappinessModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
