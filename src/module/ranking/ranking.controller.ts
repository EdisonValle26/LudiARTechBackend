import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { LifeInterceptor } from 'src/common/interceptors/life.interceptor';
import { RankingService } from './ranking.service';

@UseInterceptors(LifeInterceptor)
@Controller('ranking')
export class RankingController {
    constructor(private rankingService: RankingService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    getRanking(
        @Query('limit') limit?: string,
    ) {
        return this.rankingService.getGlobalRanking(
            limit ? Number(limit) : 50,
        );
    }
}
