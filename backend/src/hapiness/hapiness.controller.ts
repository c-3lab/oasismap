import { Controller, Get, Headers, Query } from '@nestjs/common';
import { HapinessService } from './hapiness.service';
import { HappinessMeResponse } from './interface/hapiness-me.response';

@Controller('/api/happiness/me')
export class HapinessController {
  constructor(private readonly hapinessService: HapinessService) {}

  @Get()
  async getHapinessMe(
    @Headers('Authorization') authorization: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<HappinessMeResponse[]> {
    return this.hapinessService.findHapinessMe(authorization, start, end);
  }
}
