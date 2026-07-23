import { IsBoolean, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateObservationDto {
    @IsString()
    @MinLength(1)
    id!: string;

    @IsString()
    @MinLength(1)
    foxId!: string;

    @IsInt()
    @Min(1)
    @Max(9)
    locationId!: number;

    @IsString()
    @MinLength(1)
    color!: string;

    @IsBoolean()
    hasPrey!: boolean;

    @IsInt()
    @Min(1)
    @Max(10)
    suspicionLevel!: number;

    @IsString()
    @MinLength(1)
    time!: string;
}
