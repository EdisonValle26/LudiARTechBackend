import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/dto/user.dto';
import { UsersService } from './users.service';


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

}
