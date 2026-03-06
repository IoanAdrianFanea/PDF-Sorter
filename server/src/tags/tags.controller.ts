import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * Create a new tag
   */
  @Post()
  async createTag(@Body() dto: CreateTagDto, @Request() req) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.tagsService.createTag(userId, dto);
  }

  /**
   * List all tags for current user
   */
  @Get()
  async listTags(@Request() req) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.tagsService.listTags(userId);
  }

  /**
   * Delete a tag
   */
  @Delete(':id')
  async deleteTag(@Param('id') tagId: string, @Request() req) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.tagsService.deleteTag(tagId, userId);
  }
}
