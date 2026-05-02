import { IsOptional, IsString } from 'class-validator';

export class ProfileDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    timezone?: string;
}
