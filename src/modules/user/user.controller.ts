import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  EMAIL_CHANGED,
  ACCOUNT_REMOVED,
  ACCOUNT_SUSPENDED,
  ACCOUNT_REACTIVATED,
} from '../../constants/messages';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('add-user-account')
  public addUserAccount(@Body() createUserDto: CreateUserDto) {
    return this.userService.addUserAccount(createUserDto);
  }

  @Get('list-user-account')
  public getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Put('update-user-account')
  public async updateUserAccount(
    @Query('uaid') uaid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUserAccount(uaid, updateUserDto.email);
    return EMAIL_CHANGED;
  }

  @Delete('remove-user-account')
  public async removeUserAccount(@Query('uaid') uaid: string) {
    await this.userService.removeUserAccount(uaid);
    return ACCOUNT_REMOVED;
  }

  @Put('suspend-user-account')
  public async suspendUserAccount(@Query('uaid') uaid: string) {
    await this.userService.suspendUserAccount(uaid);
    return ACCOUNT_SUSPENDED;
  }

  @Put('reactivate-user-account')
  public async reactivateUserAccount(@Query('uaid') uaid: string) {
    await this.userService.reactivateUserAccount(uaid);
    return ACCOUNT_REACTIVATED;
  }
}
