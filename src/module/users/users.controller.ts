import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Post('complete-profile')
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
    @Put('update')
    updateUser(
        @User('sub') userId: number,
        @Body() dto: UserDto,
    ) {
        return this.usersService.updateUser(userId, dto);
    }
}
