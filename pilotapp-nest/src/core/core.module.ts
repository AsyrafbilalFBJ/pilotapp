import { Global, Module } from '@nestjs/common';
import { DataStoreService } from './data-store.service.js';
import { TimeService } from './time.service.js';

/** Shared, app-wide providers: the in-memory data store and the "today" clock. */
@Global()
@Module({
  providers: [DataStoreService, TimeService],
  exports: [DataStoreService, TimeService],
})
export class CoreModule {}
