import { CurrentUser } from '@app/common';
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUserDto';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { User } from './models/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.create(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('/signin')
  async signin(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signin(user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/current')
  async current(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUser() user: User) {
    return user;
  }
}
