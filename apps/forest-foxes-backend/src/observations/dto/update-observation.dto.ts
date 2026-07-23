import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class UpdateObservationDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    foxId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(9)
    locationId?: number;

    @IsOptional()
    @IsString()
    @MinLength(1)
    color?: string;

    @IsOptional()
    @IsBoolean()
    hasPrey?: boolean;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    suspicionLevel?: number;

    @IsOptional()
    @IsString()
    @MinLength(1)
    time?: string;
}
