import { Body, Controller, Get, Param,  Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interface/user.interface';
import { LoginDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.register(createUserDto);
  }
  @Post('login')
  async login(@Body() loginDto:LoginDto): Promise<{access_token: string, userId: number, username: string}> {
    return this.userService.login(loginDto);
  }
  
  @Get('')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
  
  @Get(":id")
  async getUserById(@Param('id') id: string):Promise<User> {
    return this.userService.getUserById(id);
  }
}
