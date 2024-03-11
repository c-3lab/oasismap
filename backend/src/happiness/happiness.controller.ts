import { Controller, Get, Headers, Query } from '@nestjs/common';
import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { GetHappinessMeDto } from './dto/get-happiness-me.dto';
import { HappinessAllResponse } from './interface/happiness-all.response';
import { GetHappinessAllDto } from './dto/get-happiness-all.dto';

@Controller('/api/happiness')
export class HappinessController {
  constructor(
    private readonly happinessMeService: HappinessMeService,
    private readonly happinessAllService: HappinessAllService,
  ) {}

  @Get('/me')
  async getHapinessMe(
    @Headers('Authorization') authorization: string,
    @Query() getHappinessMeDto: GetHappinessMeDto,
  ): Promise<HappinessMeResponse[]> {
    return this.happinessMeService.findHapinessMe(
      authorization,
      getHappinessMeDto.start,
      getHappinessMeDto.end,
    );
  }

  @Get('/all')
  async getHapinessAll(
    @Query() getHappinessAllDto: GetHappinessAllDto,
  ): Promise<HappinessAllResponse> {
    return this.happinessAllService.findHapinessAll(
      getHappinessAllDto.start,
      getHappinessAllDto.end,
      getHappinessAllDto.period,
      getHappinessAllDto.zoomLevel,
    );
  }
}
