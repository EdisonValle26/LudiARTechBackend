import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendOtpEmail(to: string, otp: string) {
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM,
                to,
                subject: 'Código de recuperación de contraseña',
                html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Recuperación de contraseña</h2>
            <p>Tu código de verificación es:</p>
            <h1 style="letter-spacing: 4px;">${otp}</h1>
            <p>Este código expira en <b>10 minutos</b>.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
          </div>
        `,
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                'No se pudo enviar el correo',
            );
        }
    }
}
