import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class CreateExportDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  documentIds: string[];
}
