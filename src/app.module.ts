import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { BlockModule } from './block/block.module';
import { CacheConfigModule } from './cache/cache.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    UserModule,
    BlockModule,
    CacheConfigModule
  ],
})
export class AppModule {}
