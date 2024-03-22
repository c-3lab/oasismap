import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { HappinessInputService } from './happiness-input.service';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { GetHappinessMeDto } from './dto/get-happiness-me.dto';
import { HappinessAllResponse } from './interface/happiness-all.response';
import { GetHappinessAllDto } from './dto/get-happiness-all.dto';
import { AuthService } from 'src/auth/auth';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { HappinessResponse } from './interface/happiness.response';
import { HappinessExportService } from './happiness-export.service';
import type { Response } from 'express';
import { DateTime } from 'luxon';

@Controller('/api/happiness')
export class HappinessController {
  constructor(
    private readonly happinessInputService: HappinessInputService,
    private readonly happinessMeService: HappinessMeService,
    private readonly happinessAllService: HappinessAllService,
    private readonly happinessExportService: HappinessExportService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async createHappiness(
    @Headers('Authorization') authorization: string,
    @Body() createHappinessDto: CreateHappinessDto,
  ): Promise<HappinessResponse> {
    const userAttribute =
      await this.authService.getUserAttributeFromAuthorization(authorization);

    return this.happinessInputService.postHappiness(
      userAttribute,
      createHappinessDto,
    );
  }

  @Get('/me')
  async getHappinessMe(
    @Headers('Authorization') authorization: string,
    @Query() getHappinessMeDto: GetHappinessMeDto,
  ): Promise<HappinessMeResponse[]> {
    const userAttribute =
      await this.authService.getUserAttributeFromAuthorization(authorization);
    return this.happinessMeService.findHappinessMe(
      userAttribute,
      getHappinessMeDto.start,
      getHappinessMeDto.end,
    );
  }

  @Get('/all')
  async getHappinessAll(
    @Headers('Authorization') authorization: string,
    @Query() getHappinessAllDto: GetHappinessAllDto,
  ): Promise<HappinessAllResponse> {
    await this.authService.verifyAuthorization(authorization);
    return this.happinessAllService.findHappinessAll(
      getHappinessAllDto.start,
      getHappinessAllDto.end,
      getHappinessAllDto.period,
      getHappinessAllDto.zoomLevel,
    );
  }

  @Get('/export')
  async exportHappiness(
    @Headers('Authorization') authorization: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    await this.authService.verifyAdminAuthorization(authorization);
    const csvfile = await this.happinessExportService.exportCsv();
    const filename = DateTime.now()
      .setZone('Asia/Tokyo')
      .toFormat('yyyyMMddHHmmss');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    });

    return new StreamableFile(csvfile);
  }
}
