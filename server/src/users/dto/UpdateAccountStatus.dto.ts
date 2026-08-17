import { IsEnum } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class UpdateAccountStatusDto {
  @IsEnum(AccountStatus, {
    message: 'status must be ACTIVE, PENDING, or REJECTED',
  })
  status: AccountStatus;
}
