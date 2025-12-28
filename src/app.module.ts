import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { GamesModule } from './module/games/games.module';
import { RankingModule } from './module/ranking/ranking.module';
import { UsersModule } from './module/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true ,
      envFilePath: `.env`,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GamesModule,
    RankingModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
