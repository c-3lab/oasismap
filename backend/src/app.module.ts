import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HapinessModule } from './hapiness/hapiness.module';

@Module({
  imports: [HapinessModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
