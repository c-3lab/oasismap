import { Controller, Get, Headers, Query } from '@nestjs/common';
import { HappinessService } from './happiness.service';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { GetHappinessMeDto } from './dto/get-happiness-me.dto';

@Controller('/api/happiness')
export class HappinessController {
  constructor(private readonly happinessService: HappinessService) {}

  @Get('/me')
  async getHapinessMe(
    @Headers('Authorization') authorization: string,
    @Query() getHappinessMeDto: GetHappinessMeDto,
  ): Promise<HappinessMeResponse[]> {
    return this.happinessService.findHapinessMe(
      authorization,
      getHappinessMeDto.start,
      getHappinessMeDto.end,
    );
  }
}
