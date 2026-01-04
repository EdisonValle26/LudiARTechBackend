import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { LifeInterceptor } from 'src/common/interceptors/life.interceptor';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/dto/user.dto';
import { UsersService } from './users.service';

@UseInterceptors(LifeInterceptor)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Post('/')
    completeProfile(
        @User('sub') userId: number,
        @Body() dto: UserDto,
    ) {
        return this.usersService.completeProfile(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMyProfile(
        @User('sub') userId: number,
    ) {
        return this.usersService.getById(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    getUserStast(
        @User('sub') userId: number,
    ) {
        return this.usersService.getUserStats(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    updateUser(
        @User('sub') userId: number,
        @Body() dto: UserDto,
    ) {
        return this.usersService.updateUser(userId, dto);
    }
}
