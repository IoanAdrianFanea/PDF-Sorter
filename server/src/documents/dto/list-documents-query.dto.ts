import { IsIn, IsOptional, IsString } from 'class-validator';

export type DocumentsSortBy =
  | 'upload-newest'
  | 'upload-oldest'
  | 'name-asc'
  | 'name-desc'
  | 'status';

export class ListDocumentsQueryDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  mainFilter?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  materialType?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsString()
  deliveryDateFrom?: string;

  @IsOptional()
  @IsString()
  deliveryDateTo?: string;

  @IsOptional()
  @IsIn(['upload-newest', 'upload-oldest', 'name-asc', 'name-desc', 'status'])
  sortBy?: DocumentsSortBy;
}
