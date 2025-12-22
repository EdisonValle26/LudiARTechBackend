import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/common/jwt.strategy';
import { MailModule } from 'src/module/mail/mail.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [PrismaModule, MailModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
