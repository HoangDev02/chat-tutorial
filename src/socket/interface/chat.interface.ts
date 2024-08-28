import { Document } from 'mongoose';
export interface Message extends Document {
  to: string;
  message: string;
}
