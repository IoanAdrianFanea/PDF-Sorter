import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecycleBinService } from './recycle-bin.service';

// Recycle bin — soft-deleted documents within the retention window. ADMIN ONLY.
@Controller('recycle-bin')
@UseGuards(JwtAuthGuard)
export class RecycleBinController {
  constructor(private readonly recycleBinService: RecycleBinService) {}

  // List soft-deleted documents - ADMIN ONLY
  @Get()
  async listDeletedDocuments(@Request() req) {
    const userId = this.requireAdmin(req);
    return this.recycleBinService.listDeletedDocuments(userId);
  }

  // Restore a soft-deleted document - ADMIN ONLY
  @Post(':id/restore')
  async restoreDocument(@Param('id') id: string, @Request() req) {
    const userId = this.requireAdmin(req);
    return this.recycleBinService.restoreDocument(id, userId);
  }

  // Permanently delete a soft-deleted document - ADMIN ONLY
  @Delete(':id')
  async permanentlyDeleteDocument(@Param('id') id: string, @Request() req) {
    const userId = this.requireAdmin(req);
    return this.recycleBinService.permanentlyDeleteDocument(id, userId);
  }

  private requireAdmin(req): string {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this resource');
    }

    return userId;
  }
}
