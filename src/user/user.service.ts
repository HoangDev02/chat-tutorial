import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './interface/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-user.dto';
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>, private config: ConfigService, private jwt: JwtService) { }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // Kiểm tra xem email đã được sử dụng chưa
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo đối tượng User mới
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Lưu người dùng mới vào cơ sở dữ liệu
    return newUser.save();
  }
  async login(dto: LoginDto): Promise<{
    access_token: string;
    userId: number;
    username: string;
  }> {
    const { email, password } = dto;

    // Tìm người dùng theo email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new ForbiddenException('Email not found');
    }

    // Kiểm tra mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Password incorrect');
    }

    // Tạo access token
    const { access_token } = await this.generateAccessToken(user.id, user.email);

    return {
      access_token,
      userId: user.id,
      username: user.username,
    };
  }

  async generateAccessToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '365d',
      secret,
    });
    return { access_token: token };
  }

  // GET ALL USERS
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // GET USER BY ID
  async getUserById(id: string):Promise<User> {
    return this.userModel.findById(id);
  }
}
