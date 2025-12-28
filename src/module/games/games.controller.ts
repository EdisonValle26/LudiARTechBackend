import { Body, Controller, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { LifeInterceptor } from 'src/common/interceptors/life.interceptor';
import { User } from 'src/decorators/user.decorator';
import { GameResultDto } from 'src/dto/game-result.dto';
import { GamesService } from './games.service';

@UseInterceptors(LifeInterceptor)
@Controller('games')
export class GamesController {
    constructor(private gamesService: GamesService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':gameId/result')
    submitResult(
        @User('sub') userId: number,
        @Param('gameId') gameId: number,
        @Body() dto: GameResultDto,
    ) {
        return this.gamesService.evaluateGameResult(
            userId,
            Number(gameId),
            dto,
        );
    }
}
