import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { TagsService } from '../tags/tags.service';
import { AttachTagDto } from '../tags/dto/attach-tag.dto';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly tagsService: TagsService,
  ) {}

  /**
   * Upload a PDF file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new PayloadTooLargeException(
        `File too large. Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`,
      );
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    return this.documentsService.uploadDocument(userId, file);
  }

  /**
   * Search documents by text content
   */
  @Get('search')
  async searchDocuments(
    @Query() searchQuery: SearchQueryDto,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.documentsService.searchDocuments(userId, searchQuery.q);
  }

  /**
   * Get extracted text for a document
   */
  @Get(':id/text')
  async getDocumentText(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.documentsService.getDocumentText(id, userId);
  }

  /**
   * Get a single document by ID
   */
  @Get(':id')
  async getDocument(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.documentsService.getDocument(id, userId);
  }

  /**
   * List all documents for current user
   */
  @Get()
  async listDocuments(@Request() req, @Query('tagId') tagId?: string) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.documentsService.listDocuments(userId, tagId);
  }

  /**
   * Delete a single document
   */
  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    await this.documentsService.deleteDocument(id, userId);
    return { success: true };
  }

  /**
   * Bulk delete documents
   */
  @Post('bulk-delete')
  async bulkDeleteDocuments(
    @Body() body: { documentIds: string[] },
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    if (!Array.isArray(body.documentIds) || body.documentIds.length === 0) {
      throw new BadRequestException('documentIds must be a non-empty array');
    }

    const result = await this.documentsService.bulkDeleteDocuments(
      body.documentIds,
      userId,
    );
    return result;
  }

  /**
   * Attach a tag to a document
   */
  @Post(':id/tags')
  async attachTag(
    @Param('id') documentId: string,
    @Body() dto: AttachTagDto,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.tagsService.attachTagToDocument(documentId, dto.tagId, userId);
  }

  /**
   * Remove a tag from a document
   */
  @Delete(':id/tags/:tagId')
  async removeTag(
    @Param('id') documentId: string,
    @Param('tagId') tagId: string,
    @Request() req,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.tagsService.removeTagFromDocument(documentId, tagId, userId);
  }
}
