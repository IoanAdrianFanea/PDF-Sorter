import { Module } from '@nestjs/common';
import { LocalBlobStore } from './local-blob-store';
import { BLOB_STORE } from './blob-store.interface';

@Module({
  providers: [
    {
      provide: BLOB_STORE,
      useClass: LocalBlobStore,
    },
  ],
  exports: [BLOB_STORE],
})
export class StorageModule {}
