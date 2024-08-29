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
    const user = await this.messageModel.findOne({ to: to });
    if (!user) {
      const newUser = new this.messageModel({ to, message: [message] }); // Tạo mảng messages khi user chưa tồn tại
      return newUser.save();
    }
    // Nếu user đã tồn tại, push message mới vào mảng messages
    return this.messageModel.updateMany(
      { to },
      { $push: { message: message } } // $push message vào mảng messages
    );
  }
  
}
