import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RankingService {
    constructor(private prisma: PrismaService) { }

    async getGlobalRanking(limit = 50) {
        const stats = await this.prisma.user_stats.findMany({
            orderBy: [
                { total_points: 'desc' },
                { streak: 'desc' },
            ],
            take: limit,
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });


        return stats.map((stat, index) => ({
            position: index + 1,
            user_id: stat.users?.id,
            user_username: stat.users?.username,
            user_fullname: `${stat.users?.first_name?.split(' ')[0]} ${stat.users?.last_name?.split(' ')[0]}`,
            points: stat.total_points ?? 0,
            streak: stat.streak ?? 0,
        }));
    }
}
