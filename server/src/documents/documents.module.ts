import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ExtractionService } from './extraction.service';
import { LocalBlobStore } from '../storage/local-blob-store';
import { BLOB_STORE } from '../storage/blob-store.interface';
import { PrismaModule } from '../prisma/prisma.module';
import { TagsModule } from '../tags/tags.module';

// Documents module for upload and text extraction
@Module({
  imports: [PrismaModule, TagsModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    ExtractionService,
    // Register LocalBlobStore as provider for BLOB_STORE token
    {
      provide: BLOB_STORE,
      useClass: LocalBlobStore,
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
