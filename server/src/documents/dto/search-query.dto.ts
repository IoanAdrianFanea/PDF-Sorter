import { IsString, MinLength } from 'class-validator';

// DTO for search query validation
export class SearchQueryDto {
  @IsString()
  @MinLength(2, { message: 'Search query must be at least 2 characters long' })
  q: string;
}
