import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './mongodb/databaseModule.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketModule } from './socket/chat.module';

dotenv.config();
@Module({
  
  imports: [DatabaseModule, UserModule, ConfigModule.forRoot({isGlobal: true}),  MongooseModule.forRoot(process.env.MONGODB_CONNECT),SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
