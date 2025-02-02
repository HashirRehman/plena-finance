import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      host: 'localhost',
      port: 6379,
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
