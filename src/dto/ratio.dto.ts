import {
    IsNumber
} from 'class-validator';

export class RatioDto {
    @IsNumber()
    used: number;

    @IsNumber()
    total: number;
}