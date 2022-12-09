import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MONGO_DB_NAME } from './constants';
import { User, UserDoc } from './schemas/user.schema';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name, MONGO_DB_NAME) private userModel: Model<UserDoc>) {}

  async createUser(user: Partial<User>): Promise<User> {
    try {
        const newUser = new this.userModel(user);
        return await newUser.save();
    } catch (err) {
        this.logger.error(err.message);
        return null;
    }
  }

  async deleteUser(_id: string): Promise<User> {
    return await this.userModel.findOneAndDelete({ _id });
  }

  async findByObjectId(_id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(_id);
      return user;
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }
  
  async patchUser(_id: string, update: Partial<User>): Promise<User> {
        try {
            let user = await this.userModel.findById(_id);
            user.set(update);
            return await user.save();
        } catch (err) {
            this.logger.error(err.message);
            return null;
        }
    }
    
    async findByUserName(name: string): Promise<User> {
        try {
            const user = await this.userModel.findOne({username: name});
            return user;
        } catch (err) {
            this.logger.error(err.message);
            return null;
        }
    }

    async findByName(firstname?: string, lastname?: string, username?: string): Promise<User[]> {
        try {
            const firstName = await this.userModel.find({firstname: firstname});
            const lastName = await this.userModel.find({lastname: lastname});
            const userName = await this.userModel.find({username: username});
            
            if (firstName.length != 0) {
                return firstName;
            } else if (lastName.length != 0) {
                return lastName;
            } else if (userName.length != 0) {
                return userName;
            } else {
                return [];
            }
        } catch (err) {
            this.logger.error(err.message);
        }
    }
}
