import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    const user = await createdUser.save();
    await this.cacheManager.set(user.id, user);
    return user;
  }

  async findAll(): Promise<User[]> {
    const cachedUsers = await this.cacheManager.get<User[]>('users');
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this.userModel.find().exec();
    await this.cacheManager.set('users', users);
    return users;
  }

  async findOne(id: string): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(id);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set(id, user);
    return user;
  }

  async update(id: string, updateUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set(id, existingUser);
    await this.cacheManager.del('users'); // Invalidate the cache for the users list
    return existingUser;
  }

  async delete(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.del(id);
    await this.cacheManager.del('users'); // Invalidate the cache for the users list
    return deletedUser;
  }

  async search(username: string, minAge: number, maxAge: number): Promise<User[]> {
    const query = {};
    if (username) {
      query['username'] = new RegExp(username, 'i');
    }
    if (minAge || maxAge) {
      const now = new Date();
      if (minAge) {
        query['birthdate'] = { $lte: new Date(now.setFullYear(now.getFullYear() - minAge)) };
      }
      if (maxAge) {
        query['birthdate'] = { ...query['birthdate'], $gte: new Date(now.setFullYear(now.getFullYear() - maxAge)) };
      }
    }
    const users = await this.userModel.find(query).exec();
    return users;
  }
}
