import { Schema } from 'mongoose';
export const MessageSchema = new Schema({
  to: String,
  message: [],
});
