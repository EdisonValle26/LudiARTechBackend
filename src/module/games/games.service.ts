import { BadRequestException, Injectable } from '@nestjs/common';
import { GameResultDto } from 'src/dto/game-result.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GamesService {
    constructor(private prisma: PrismaService) { }

    async evaluateGameResult(
        userId: number,
        gameId: number,
        dto: GameResultDto,
    ) {
        const MAX_POINTS = 50000;

        const game = await this.prisma.games.findUnique({
            where: { id: gameId },
        });

        if (!game) {
            throw new BadRequestException('Juego no encontrado');
        }

        // Stats del usuario
        let stats = await this.prisma.user_stats.findUnique({
            where: { user_id: userId },
        });

        if (!stats) {
            stats = await this.prisma.user_stats.create({
                data: { user_id: userId },
            });
        }

        // CASO PERDER
        if (dto.status !== 'WIN') {
            await this.prisma.user_stats.update({
                where: { user_id: userId },
                data: {
                    lives: Math.max((stats.lives ?? 0) - 1, 0),
                    streak: 0,
                    updated_at: new Date(),
                },
            });

            return {
                result: 'LOSE',
                reason: dto.status,
                lives: (stats.lives ?? 0) - 1,
            };
        }

        // CASO GANAR
        let score = game.max_points ?? 0;

        // Pesos
        const MOVEMENTS_WEIGHT = 0.3;
        const TIME_WEIGHT = 0.4;
        const ERRORS_WEIGHT = 0.6;

        let perfect = true;

        //MOVIMIENTOS
        if (dto.movements) {
            const movementRatio = dto.movements.used / dto.movements.total;
            score -= score * movementRatio * MOVEMENTS_WEIGHT;

            if (movementRatio > 0.5) {
                perfect = false;
            }
        }

        // TIEMPO
        if (dto.time) {
            const timeRatio = dto.time.used / dto.time.total;
            score -= score * timeRatio * TIME_WEIGHT;

            if (timeRatio > 0.6) {
                perfect = false;
            }
        }

        // ERRORES
        if (dto.errors) {
            const errorRatio = dto.errors.used / dto.errors.total;
            score -= score * errorRatio * ERRORS_WEIGHT;

            if (errorRatio > 0.2) {
                perfect = false;
            }
        }

        score = Math.max(0, Math.round(score));

        // ¿Juego completado antes?
        const alreadyCompleted = await this.prisma.game_score_history.findFirst({
            where: {
                user_id: userId,
                game_id: gameId,
            },
            select: { id: true },
        });

        const shouldIncreaseGamesCompleted = !alreadyCompleted;

        const currentPoints = stats.total_points ?? 0;
        const newTotalPoints = Math.min(currentPoints + score, MAX_POINTS);

        const reachedMaxPoints =
            currentPoints < MAX_POINTS && newTotalPoints === MAX_POINTS;

        await this.prisma.$transaction([
            this.prisma.game_score_history.create({
                data: {
                    user_id: userId,
                    game_id: gameId,
                    points: score,
                },
            }),

            this.prisma.user_stats.update({
                where: { user_id: userId },
                data: {
                    total_points: newTotalPoints,

                    games_completed: shouldIncreaseGamesCompleted
                        ? (stats.games_completed ?? 0) + 1
                        : stats.games_completed ?? 0,

                    streak: perfect
                        ? (stats.streak ?? 0) + 1
                        : 0,

                    updated_at: new Date(),
                },
            }),

            ...(reachedMaxPoints
                ? [
                    this.prisma.user_badges.create({
                        data: {
                            user_id: userId,
                            badge_id: 5,
                        },
                    }),
                ]
                : []),
        ]);

        return {
            result: 'WIN',
            score,
            streak_gained: perfect,
        };
    }
}