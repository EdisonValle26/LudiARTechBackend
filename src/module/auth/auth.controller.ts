import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';
import { RequestPasswordResetDto } from 'src/dto/request-password-reset.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    changePassword(
        @User('sub') userId: number,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(userId, dto);
    }

    @Post('request-password-reset')
    requestReset(@Body() dto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(dto.email);
    }

    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }


}
