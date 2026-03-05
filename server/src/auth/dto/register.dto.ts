import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO for registration request validation
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
