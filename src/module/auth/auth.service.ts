import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { MailService } from 'src/module/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,

    ) { }

    async register(data: RegisterDto) {
        const exists = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { email: data.email },
                ],
            },
        });

        if (exists) {
            throw new BadRequestException('Usuario o email ya existe');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.users.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                email: true,
                created_at: true,
            },
        });

        return user;
    }

    async login(data: LoginDto) {
        const user = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { username: data.username },
                ],
            },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const passwordValid = await bcrypt.compare(
            data.password,
            user.password,
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isFirstLogin = user.first_login;

        if (isFirstLogin) {
            await this.prisma.users.update({
                where: { id: user.id },
                data: {
                    first_login: false,
                    updated_at: new Date(),
                },
            });
        }

        const token = jwt.sign(
            {
                sub: user.id,
                username: user.username,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' },
        );

        return {
            token: token,

            first_login: isFirstLogin,

            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
        };
    }

    async changePassword(userId: number,
        data: ChangePasswordDto) {
        const user = await this.prisma.users.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const isCurrentValid = await bcrypt.compare(
            data.currentPassword,
            user.password,
        );

        if (!isCurrentValid) {
            throw new UnauthorizedException('Contraseña actual incorrecta');
        }

        const isSamePassword = await bcrypt.compare(
            data.newPassword,
            user.password,
        );

        if (isSamePassword) {
            throw new BadRequestException(
                'La nueva contraseña no puede ser igual a la anterior',
            );
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        await this.prisma.users.update({
            where: { id: Number(userId) },
            data: {
                password: hashedPassword,
                updated_at: new Date(),
            },
        });

        return {
            message: 'Contraseña actualizada correctamente',
        };
    }

    async requestPasswordReset(email: string) {
        const user = await this.prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        const otp = randomInt(1000, 9999).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        await this.prisma.password_reset.create({
            data: {
                user_id: user.id,
                otp: otpHash,
                expires_at: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        await this.mailService.sendOtpEmail(user.email, otp);

        return {
            message: 'Código OTP enviado al correo',
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const otpRecord = await this.prisma.password_reset.findFirst({
            where: {
                used: false,
                expires_at: { gt: new Date() },
            },
            orderBy: { created_at: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('OTP inválido o expirado');
        }

        const otpValid = await bcrypt.compare(dto.otp, otpRecord.otp);

        if (!otpValid) {
            throw new BadRequestException('OTP incorrecto');
        }

        const user = await this.prisma.users.findUnique({
            where: { id: Number(otpRecord.user_id) },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no válido');
        }

        const samePassword = await bcrypt.compare(
            dto.newPassword,
            user.password,
        );

        if (samePassword) {
            throw new BadRequestException(
                'La nueva contraseña no puede ser igual a la anterior',
            );
        }

        const newHashed = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.users.update({
            where: { id: user.id },
            data: {
                password: newHashed,
                updated_at: new Date(),
            },
        });

        await this.prisma.password_reset.update({
            where: { id: otpRecord.id },
            data: { used: true },
        });

        return {
            message: 'Contraseña actualizada correctamente',
        };
    }

}
