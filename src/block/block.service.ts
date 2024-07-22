import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class BlockService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async blockUser(subjectId: string, blockUserId: string): Promise<User> {
        const user = await this.userModel.findById(subjectId).exec();
        const blockUser = await this.userModel.findById(blockUserId).exec();
        if (!user || !blockUser) {
            throw new NotFoundException('User not found');
        }
        user.blockedUsers.push(blockUserId);
        return user.save();
    }

    async unblockUser(subjectId: string, blockUserId: string): Promise<User> {
        const user = await this.userModel.findById(subjectId).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.blockedUsers = user.blockedUsers.filter(id => id !== blockUserId);
        return user.save();
    }
}
