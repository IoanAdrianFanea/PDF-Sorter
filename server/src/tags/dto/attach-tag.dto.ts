import { IsString, IsNotEmpty } from 'class-validator';

// DTO for attaching a tag to a document
export class AttachTagDto {
  @IsString()
  @IsNotEmpty({ message: 'Tag ID is required' })
  tagId: string;
}
