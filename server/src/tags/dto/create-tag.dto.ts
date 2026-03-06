import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

// DTO for creating a new tag
export class CreateTagDto {
  @IsString()
  @MinLength(1, { message: 'Tag name must not be empty' })
  @MaxLength(50, { message: 'Tag name must not exceed 50 characters' })
  @Transform(({ value }) => value.trim())
  name: string;
}
