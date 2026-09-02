import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HappinessModule } from './happiness/happiness.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Happiness } from './change-histories/happiness.entity';
import { ChangeHistoriesModule } from './change-histories/change-histories.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [Happiness],
      synchronize: false,
    }),
    HappinessModule,
    ChangeHistoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
