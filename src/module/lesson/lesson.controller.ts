import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/Guards/jwt-auth.guard';
import { LifeInterceptor } from 'src/common/interceptors/life.interceptor';
import { User } from 'src/decorators/user.decorator';
import { LessonResultDto } from 'src/dto/lesson-result.dto';
import { LessonService } from './lesson.service';

@UseInterceptors(LifeInterceptor)
@Controller('lessons')
export class LessonController {
    constructor(private lessonService: LessonService) { }

    @UseGuards(JwtAuthGuard)
    @Get('status')
    getLessonStatus(
        @User('sub') userId: number,
    ) {
        return this.lessonService.getLessonStatus(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('certificate-status')
    getCertificateStatus(
        @User('sub') userId: number,
    ) {
        return this.lessonService.getCertificateStatus(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('complete')
    completeLesson(
        @User('sub') userId: number,
        @Body() dto: LessonResultDto,
    ) {
        return this.lessonService.completeLesson(userId, dto);
    }
}
