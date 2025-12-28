import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LifeInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {

        const req = context.switchToHttp().getRequest();

        if (!req.user || !req.user.sub) {
            return next.handle();
        }

        const userId = req.user.sub;

        const user = await this.prisma.users.findUnique({
            where: { id: userId },
            include: {
                user_stats: true,
            },
        });

        if (!user || !user.user_stats) {
            return next.handle();
        }

        const stats = user.user_stats;

        const now = new Date();
        const lastUpdate = stats.updated_at ?? now;

        const diffMs = now.getTime() - lastUpdate.getTime();
        const minutesPassed = Math.floor(diffMs / 60000);

        if (minutesPassed >= 5 && Number(stats.lives) < 10) {
            const livesToRecover = Math.floor(minutesPassed / 5);
            const newLives = Math.min(10, Number(stats.lives) + livesToRecover);

            await this.prisma.user_stats.update({
                where: { id: stats.id },
                data: {
                    lives: newLives,
                    updated_at: now,
                },
            });

            stats.lives = newLives;
            stats.updated_at = now;
        }

        req.userEntity = user;

        return next.handle();
    }
}
