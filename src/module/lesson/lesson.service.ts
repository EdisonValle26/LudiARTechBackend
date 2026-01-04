import { Injectable } from '@nestjs/common';
import { LessonResultDto } from 'src/dto/lesson-result.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LessonService {
    constructor(private prisma: PrismaService) { }

    async getLessonStatus(userId: number) {
        const sections = await this.prisma.sections.findMany({
            include: {
                games: true,
                lessons: true,
            },
        });

        const userGameHistory = await this.prisma.game_score_history.findMany({
            where: { user_id: userId },
        });

        const userLessons = await this.prisma.user_lessons.findMany({
            where: { user_id: userId },
            include: { lessons: true },
        });

        return sections.map(section => {
            const gamesInSection = section.games.map(g => g.id);

            const completedGamesInSection = new Set(
                userGameHistory
                    .filter(h => gamesInSection.includes(h.game_id!))
                    .map(h => h.game_id)
            );

            const allGamesCompleted =
                gamesInSection.length > 0 &&
                completedGamesInSection.size === gamesInSection.length;

            const lesson = section.lessons[0];

            const userLesson = lesson
                ? userLessons.find(ul => ul.lesson_id === lesson.id)
                : null;

            let status: 'bloqueada' | 'desbloqueada' | 'completada' = 'bloqueada';

            if (allGamesCompleted) {
                status = 'desbloqueada';
            }

            if (userLesson && userLesson.score !== null) {
                status = 'completada';
            }

            return {
                sectionId: section.id,
                section: section.name,
                lessonId: lesson?.id ?? null,
                lesson: lesson?.name ?? null,
                score: userLesson?.score ? Number(userLesson?.score) : 0,
                status,
            };
        });
    }

    async completeLesson(
        userId: number,
        dto: LessonResultDto,) {
        const score = Number(dto.score);
        const lesson = await this.prisma.user_lessons.upsert({
            where: {
                user_id_lesson_id: {
                    user_id: userId,
                    lesson_id: Number(dto.lessonId),
                },
            },
            update: {
                score,
                completed_at: new Date(),
            },
            create: {
                user_id: userId,
                lesson_id: Number(dto.lessonId),
                score,
                completed_at: new Date(),
            },
        });

        // Insignias
        const completedCount = await this.prisma.user_lessons.count({
            where: {
                user_id: userId,
                score: { not: null },
            },
        });

        if (completedCount <= 3) {
            await this.prisma.user_badges.upsert({
                where: {
                    user_id_badge_id: {
                        user_id: userId,
                        badge_id: completedCount + 1,
                    },
                },
                update: {},
                create: {
                    user_id: userId,
                    badge_id: completedCount + 1,
                },
            });
        }

        return {
            message: 'Lección completada',
            score,
        };
    }

}
