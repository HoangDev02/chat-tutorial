import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './interface/chat.interface';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  private readonly algorithm = 'aes-256-ctr';
  private readonly secretKey = crypto.randomBytes(32);
  private readonly iv = crypto.randomBytes(16);

  async encryptMessage(message: string): Promise<string> {
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
    const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);
    return encrypted.toString('hex');
  }
  async saveMessage(to: string, message: string) {
    const newMessage = new this.messageModel({ to, message });
    return newMessage.save();
  }
}
