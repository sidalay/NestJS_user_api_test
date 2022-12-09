import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    NotFoundException,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CsvParser } from 'src/providers/csv-parser.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User API')
@Controller('user')
export class UserController {
  private logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiOkResponse({ type: UserDto })
  async create(@Body() body: CreateUserDto): Promise<UserDto> {
    return await this.userService.createUser(body);
  }

  @Patch('/update/:_id')
  @ApiOperation({ summary: 'Partially update a user' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  async updateById(@Param('_id') _id: string, @Body() body: UpdateUserDto): Promise<UserDto> {
    return await this.userService.patchUser(_id, body);
  }

  @Delete('/:_id')
  @ApiOperation({ summary: 'Delete a user ' })
  async deleteById(@Param('_id') _id: string): Promise<UserDto> {
    try {
      return await this.userService.deleteUser(_id);
    } catch (e) {
      this.logger.error(e.message);
      throw new NotFoundException(`User id '${_id}' not found.`);
    }
  }

  @Get('/username/:username')
  @ApiOperation({ summary: 'Find user by username' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  async getByUsername(@Param('username') username: string): Promise<UserDto> {
    return await this.userService.findByUserName(username);
  }

  @Get('/:_id')
  @ApiOperation({ summary: 'Find user by mongo object id' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  async getById(@Param('_id') _id: string): Promise<UserDto> {
    const user = await this.userService.findByObjectId(_id);

    if (!user) {
      throw new NotFoundException(`User id '${_id}' not found.`);
    }

    return user;
  }

  /*
  * The upper casing of 'N' in user properties firstName & lastName was 
  * causing the csv header's firstname & lastname to not be accounted for.
  * I could have adjusted the csv headers but I assume that in a real 
  * situation we might not always have access to the csv so instead I 
  * changed the schema and DTO to properly account for the csv format.
  */
  @Post('/seed-data')
  @ApiOperation({ summary: 'Load data from ./seed-data/users.csv into our mongo database' })
  async seedData() {
    const users: CreateUserDto[] = await CsvParser.parse('seed-data/users.csv');
    
    for (let i = 0; i < users.length; ++i) {
        await this.userService.createUser(users[i]);
    }
  }

  @Get('/search/:firstname?/:lastname?/:username?')
  @ApiOperation({ summary: 'Search a user by any combination of firstname, lastname, username' })
  @ApiParam({ name: 'firstname', required: false})
  @ApiParam({ name: 'lastname', required: false})
  @ApiParam({ name: 'username', required: false})
  async getByName(
    @Param('firstname') firstName?: string, 
    @Param('lastname') lastName?: string, 
    @Param('username') username?: string): Promise<UserDto[]> 
  {
    const result = await this.userService.findByName(firstName, lastName, username);
    if (result.length == 0) {
        throw new NotFoundException('User not found');
    }
    return result;
  }
}
