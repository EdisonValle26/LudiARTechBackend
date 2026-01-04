import {
    IsNotEmpty,
    IsNumber
} from 'class-validator';


export class LessonResultDto {
    @IsNotEmpty()
    @IsNumber()
    lessonId: Number;

    @IsNotEmpty()
    @IsNumber()
    score: Number;

}
