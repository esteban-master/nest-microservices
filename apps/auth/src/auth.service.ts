import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import { User, UserDocument } from './models/user';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel(createUserDto);
      await newUser.save();
      return newUser;
    } catch (error) {
      if (error.code === 11000)
        throw new BadRequestException(
          `The email ${createUserDto.email} already exists`,
        );
      throw new InternalServerErrorException();
    }
  }

  async signin(user: User, res: Response) {
    const token = this.jwtService.sign({ user });
    res.cookie('Authentication', token, {
      secure: true,
      signed: false,
    });

    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Invalid credentials');

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) throw new BadRequestException('Invalid credentials');

    return user;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    return user;
  }
}
