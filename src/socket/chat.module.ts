import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { MessageSchema } from 'src/schema/chat.schema';
import { ChatGateway } from './chat.gateway';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema}]), // Đăng ký schema
  ],
  providers: [ChatGateway, ChatService],
})
export class SocketModule {}