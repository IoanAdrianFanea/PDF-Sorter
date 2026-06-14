import { IsEmail } from 'class-validator';
import { IsStrongPassword } from './password-policy.decorator';

// DTO for registration request validation
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
