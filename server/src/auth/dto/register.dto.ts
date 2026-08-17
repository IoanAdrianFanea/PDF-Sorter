import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsStrongPassword } from './password-policy.decorator';

// DTO for registration request validation
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;
}
