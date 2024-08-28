import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from '../schema/user.schema';
import { UserProviders } from '../schema/user.provider';
import { DatabaseModule } from 'src/mongodb/databaseModule.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule, 
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), // Kết nối model User với MongoDB
    JwtModule.register({})
  ],
  controllers: [UserController],
  providers: [UserService, ...UserProviders],
})
export class UserModule {}