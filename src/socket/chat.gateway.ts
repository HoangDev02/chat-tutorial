import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(81, { transports: ['websocket'], cors: true })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private clients: Map<string, string> = new Map(); // Store client IDs

  constructor(private chatService: ChatService) { }

  afterInit(server: Server) {
    console.log('Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    // Chờ client gửi userId thông qua sự kiện 'register'
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove the client ID from the map
    const userId = Array.from(this.clients.entries()).find(
      ([key, value]) => value === client.id
    )?.[0];
    if (userId) {
      this.clients.delete(userId);
    }
  }

  // Sự kiện để client đăng ký userId
  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: string }) {
    // Check if userId already exists in clients
    if (this.clients.has(payload.userId)) {
      console.log(`UserId ${payload.userId} is already registered with socketId: ${this.clients.get(payload.userId)}`);
      return; // Do not register again
    }

    console.log(`Registering userId: ${payload.userId} with socketId: ${client.id}`);
    this.clients.set(payload.userId, client.id);
  }
  @SubscribeMessage('sendMessage')
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { from: string; to: string; message: string }) {
    const encryptedMessage = await this.chatService.encryptMessage(payload.message);
    await this.chatService.saveMessage(payload.to, encryptedMessage);

    // Lấy socketId của người nhận (User B)
    const recipientSocketId = this.clients.get(payload.to);
    
    // Lấy socketId của người gửi (User A)
    const senderSocketId = this.clients.get(payload.from);

    // Nội dung tin nhắn gửi đi
    const messageData = {
      from: payload.from,  // Người gửi
      to: payload.to,      // Người nhận
      message: payload.message, // Nội dung tin nhắn
      timestamp: new Date(), // Thời gian gửi tin nhắn
    };

    // Gửi tin nhắn cho người nhận (User B)
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('receiveMessage', messageData);
    }

    // Gửi lại tin nhắn cho người gửi (User A)
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('receiveMessage', messageData);
    }
  }


}
