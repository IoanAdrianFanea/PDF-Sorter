import { IsEmail, IsString } from 'class-validator';

// DTO for login request validation
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
