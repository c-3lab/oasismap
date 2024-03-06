import { HappinessMeService } from './happiness-me.service';
import { HappinessAllService } from './happiness-all.service';
import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { HappinessInputService } from './happiness-input.service';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { GetHappinessMeDto } from './dto/get-happiness-me.dto';
import { HappinessAllResponse } from './interface/happiness-all.response';
import { GetHappinessAllDto } from './dto/get-happiness-all.dto';
import { AuthService } from 'src/auth/auth';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { HappinessResponse } from './interface/happiness.response';

@Controller('/api/happiness')
export class HappinessController {
  constructor(
    private readonly happinessInputService: HappinessInputService,
    private readonly happinessMeService: HappinessMeService,
    private readonly happinessAllService: HappinessAllService,
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
