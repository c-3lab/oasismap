import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import { HappinessListService } from './happiness-list.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  ParseBoolPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { HappinessInputService } from './happiness-input.service';
import { HappinessListResponse } from './interface/happiness-list.response';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { GetHappinessListDto } from './dto/get-happiness-list.dto';
import { GetHappinessMeDto } from './dto/get-happiness-me.dto';
import { HappinessAllResponse } from './interface/happiness-all.response';
import { GetHappinessAllDto } from './dto/get-happiness-all.dto';
import { AuthService } from 'src/auth/auth';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { HappinessResponse } from './interface/happiness.response';
import { HappinessExportService } from './happiness-export.service';
import type { Response, Express } from 'express';
import { DateTime } from 'luxon';
import { HappinessImportService } from './happiness-import.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { HappinessImportResponse } from './interface/happiness-import.response';
@Controller('/api/happiness')
export class HappinessController {
  constructor(
    private readonly happinessInputService: HappinessInputService,
    private readonly happinessMeService: HappinessMeService,
    private readonly happinessListService: HappinessListService,
    private readonly happinessAllService: HappinessAllService,
    private readonly happinessExportService: HappinessExportService,
    private readonly happinessImportService: HappinessImportService,
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
  ): Promise<HappinessMeResponse> {
    const userAttribute =
      await this.authService.getUserAttributeFromAuthorization(authorization);
    return this.happinessMeService.findHappinessMe(
      userAttribute,
      getHappinessMeDto.start,
      getHappinessMeDto.end,
      getHappinessMeDto.limit,
      getHappinessMeDto.offset,
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
      getHappinessAllDto.limit,
      getHappinessAllDto.offset,
      getHappinessAllDto.period,
      getHappinessAllDto.zoomLevel,
    );
  }

  @Get('/list')
  async getHappinessList(
    @Headers('Authorization') authorization: string,
    @Query() getHappinessListDto: GetHappinessListDto,
  ): Promise<HappinessListResponse> {
    const userAttribute =
      await this.authService.getUserAttributeFromAuthorization(authorization);
    return this.happinessListService.findHappinessList(
      userAttribute,
      getHappinessListDto.limit,
      getHappinessListDto.offset,
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
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    return new StreamableFile(csvfile);
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('csvFile'))
  async importHappiness(
    @Headers('Authorization') authorization: string,
    @UploadedFile() csvFile: Express.Multer.File,
    @Body('isRefresh', ParseBoolPipe) isRefresh: boolean,
  ): Promise<HappinessImportResponse> {
    await this.authService.verifyAdminAuthorization(authorization);
    return await this.happinessImportService.importCsv(csvFile, isRefresh);
  }
}
