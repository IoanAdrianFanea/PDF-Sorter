import { IsOptional, IsString, MinLength } from 'class-validator';

export class UploadDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;
}
