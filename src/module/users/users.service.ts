import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,

    ) { }

    async completeProfile(
        userId: number,
        dto: UserDto,
    ) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const updatedUser = await this.prisma.users.update({
            where: { id: userId },
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                age: dto.age,
                gender: dto.gender,
                course: dto.course,
                phone: dto.phone,
                location: dto.location,
                updated_at: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                age: true,
                gender: true,
                course: true,
                phone: true,
                location: true,
            },
        });

        await this.prisma.user_stats.create({
            data: {
                user_id: user.id,
                lives: 10,
            },
        });

        await this.prisma.user_badges.create({
            data: {
                user_id: userId,
                badge_id: 1,
            },
        });

        return {
            message: 'Perfil completado correctamente',
            user: updatedUser,
        };
    }

    async getById(userId: number) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                age: true,
                gender: true,
                course: true,
                phone: true,
                location: true,
                created_at: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const formattedDate = user.created_at?.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
        });

        return {
            ...user,
            created_at: formattedDate,
        };
    }

    async updateUser(userId: number, dto: UserDto) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const updatedUser = await this.prisma.users.update({
            where: { id: userId },
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                age: dto.age,
                gender: dto.gender,
                course: dto.course,
                email: dto.email,
                location: dto.location,
                updated_at: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                age: true,
                gender: true,
                course: true,
                phone: true,
                location: true,
            },
        });

        return {
            message: 'Usuario actualizado correctamente',
            user: updatedUser,
        };
    }

    async getUserStats(userId: number) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: {
                user_stats: true,
                user_badges: { include: { badges: true } },
            },
        });

        const allLessons = await this.prisma.lessons.findMany({
            select: { id: true, name: true },
        });

        const userLessons = await this.prisma.user_lessons.findMany({
            where: { user_id: userId },
            select: { lesson_id: true, score: true },
        });

        const userLessonMap = new Map(
            userLessons.map(l => [l.lesson_id, Number(l.score)])
        );

        const lessons = allLessons.map(lesson => ({
            name: lesson.name,
            score: userLessonMap.get(lesson.id) ?? 0,
        }));

        const completedLessons = userLessons.filter(l => l.score !== null);

        const avgScore =
            completedLessons.length > 0
                ? completedLessons.reduce((a, b) => a + Number(b.score), 0) /
                completedLessons.length
                : 0;

        const allUsers = await this.prisma.user_stats.findMany({
            orderBy: { total_points: 'desc' },
        });

        const rank = allUsers.findIndex(u => u.user_id === userId) + 1;

        const totalPoints = user?.user_stats?.total_points ?? 0;
        const POINTS_PER_LEVEL = 1000;
        const MAX_POINTS = 50000;

        const cappedPoints = Math.min(totalPoints, MAX_POINTS);

        const level = Math.floor(cappedPoints / POINTS_PER_LEVEL);

        const levelMaxPoints = Math.min(
            (level  + 1) * POINTS_PER_LEVEL,
            MAX_POINTS
        );

        const progress =
            cappedPoints >= MAX_POINTS
                ? 'Max'
                : `${cappedPoints}/${levelMaxPoints}`;

        return {
            username: user?.username,
            fullname: `${user?.first_name?.split(' ')[0]} ${user?.last_name?.split(' ')[0]}`,
            badge: user?.user_badges.at(-1)?.badges?.name,
            ranking: `${rank} de ${allUsers.length}`,
            level,
            progress,
            points: cappedPoints,
            lives: user?.user_stats?.lives,
            streak: user?.user_stats?.streak,
            badges: user?.user_badges.length,
            lesson_average: avgScore.toFixed(2),
            lessons,
        };
    }

}
