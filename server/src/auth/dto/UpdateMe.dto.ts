import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  // Changing this re-triggers email verification (see AuthService.updateMe)
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
