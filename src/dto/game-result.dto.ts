import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { RatioDto } from './ratio.dto';


export class GameResultDto {
    @IsNotEmpty()
    @IsString()
    status: 'WIN' | 'LOSE';

    @IsOptional()
    @ValidateNested()
    @Type(() => RatioDto)
    movements?: RatioDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => RatioDto)
    time?: RatioDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => RatioDto)
    errors?: RatioDto;

    @IsOptional()
    @IsNumber()
    correctAnswers?: number;
}
