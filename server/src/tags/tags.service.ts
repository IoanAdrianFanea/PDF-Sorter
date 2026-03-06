import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { Prisma } from '@prisma/client';

// Tags business logic
@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new tag
   */
  async createTag(userId: string, dto: CreateTagDto) {
    try {
      const tag = await this.prisma.tag.create({
        data: {
          ownerId: userId,
          name: dto.name,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });

      return tag;
    } catch (error) {
      // Handle unique constraint violation (tag name already exists for user)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Tag with name "${dto.name}" already exists`,
        );
      }

      throw error;
    }
  }

  /**
   * List all tags for a user (sorted alphabetically)
   */
  async listTags(userId: string) {
    const tags = await this.prisma.tag.findMany({
      where: { ownerId: userId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });

    return tags;
  }

  /**
   * Attach a tag to a document
   */
  async attachTagToDocument(
    documentId: string,
    tagId: string,
    userId: string,
  ) {
    // Verify document ownership
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.ownerId !== userId) {
      throw new NotFoundException('Document not found');
    }

    // Verify tag ownership
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.ownerId !== userId) {
      throw new NotFoundException('Tag not found');
    }

    // Check if relation already exists
    const existingRelation = await this.prisma.documentTag.findUnique({
      where: {
        documentId_tagId: {
          documentId,
          tagId,
        },
      },
    });

    if (existingRelation) {
      throw new BadRequestException('Tag is already attached to this document');
    }

    // Create DocumentTag relation
    await this.prisma.documentTag.create({
      data: {
        documentId,
        tagId,
      },
    });

    return { success: true };
  }

  /**
   * Remove a tag from a document
   */
  async removeTagFromDocument(
    documentId: string,
    tagId: string,
    userId: string,
  ) {
    // Verify document ownership
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.ownerId !== userId) {
      throw new NotFoundException('Document not found');
    }

    // Verify tag ownership
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.ownerId !== userId) {
      throw new NotFoundException('Tag not found');
    }

    // Delete DocumentTag relation
    await this.prisma.documentTag.delete({
      where: {
        documentId_tagId: {
          documentId,
          tagId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Delete a tag (removes from all documents via cascade)
   */
  async deleteTag(tagId: string, userId: string) {
    // Verify tag ownership
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.ownerId !== userId) {
      throw new NotFoundException('Tag not found');
    }

    // Delete tag (cascade will remove DocumentTag relations)
    await this.prisma.tag.delete({
      where: { id: tagId },
    });

    return { success: true };
  }
}
