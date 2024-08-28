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

  constructor(private chatService: ChatService) {}

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
    console.log(`Registering userId: ${payload.userId} with socketId: ${client.id}`);
    this.clients.set(payload.userId, client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { to: string; message: string }) {
    const encryptedMessage = await this.chatService.encryptMessage(payload.message);
    await this.chatService.saveMessage(payload.to, encryptedMessage);

    console.log('Sending message to:', payload.to);
    console.log('Encrypted message:', encryptedMessage);
    
    // Get the recipient's socket ID
    const recipientSocketId = payload.to ? this.clients.get(payload.to) : undefined;
 
    
    if (recipientSocketId) {
      // Send the message to the recipient
      this.server.to(recipientSocketId).emit('receiveMessage', payload.message);
    } else {
      console.log('Recipient not connected');
    }
  }
}
