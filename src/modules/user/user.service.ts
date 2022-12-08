import { BadRequestException, Injectable } from '@nestjs/common';
import { Validator } from 'jsonschema';
import validator from 'validator';
import {
  NOT_VALID_AGE,
  NOT_VALID_EMAIL,
  USERS_NOT_FOUND,
  USER_EXIST,
  USER_NOT_ACTIVE,
  USER_NOT_SUSPENDED,
} from '../../constants/error-messages';
import { userMapper } from '../../mappers/user.mapper';
import { CreateUserDto } from './dto/create-user.dto';
import { UserActivityStatus } from '../../enums/user-activity-status';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private schemaValidator: Validator;
  constructor(private userRepository: UserRepository) {
    this.schemaValidator = new Validator();
  }

  private validateUserCreatingData(createUserDto: CreateUserDto) {
    const userCreatingSchema = {
      type: 'object',
      properties: {
        fullName: { type: 'string', maxLength: 100 },
        birthDate: { type: 'string', format: 'date' },
        email: { type: 'string', format: 'email', maxLength: 200 },
      },
    };

    const result = this.schemaValidator.validate(
      createUserDto,
      userCreatingSchema,
    );
    if (result.valid === false) {
      throw new BadRequestException(result.errors[0].stack);
    }
  }

  private validateUserUpdateData(email: string) {
    if (validator.isEmail(email) === false) {
      throw new BadRequestException(NOT_VALID_EMAIL);
    }
  }

  private async createRandomUaid() {
    let uaid = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 24; i++) {
      uaid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const userWithUaid = await this.userRepository.getUserAccountBy(uaid);
    if (!!userWithUaid) {
      await this.createRandomUaid();
    }
    return uaid;
  }

  public async addUserAccount(createUserDto: CreateUserDto) {
    this.validateUserCreatingData(createUserDto);
    const { fullName, birthDate, email } = createUserDto;
    const existUserAccount = await this.userRepository.getUserAccountBy(
      email.toLowerCase(),
    );
    if (!!existUserAccount) {
      throw new BadRequestException(USER_EXIST);
    }
    const uaid = await this.createRandomUaid();
    const yearsRange =
      new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (yearsRange < 18) {
      throw new BadRequestException(NOT_VALID_AGE);
    }
    const status = await this.userRepository.getActivityStatusCodeByStatus(
      UserActivityStatus.ACTIVE,
    );
    await this.userRepository.addUserAccount(
      fullName,
      birthDate,
      email.toLowerCase(),
      uaid,
      status,
    );
    const userAccount = await this.userRepository.getUserAccountBy(uaid);
    return userMapper(userAccount);
  }

  public async getAllUsers() {
    const users = await this.userRepository.getAllUserAccounts();
    if (!users[0]) {
      throw new BadRequestException(USERS_NOT_FOUND);
    }
    return users.map(user => userMapper(user));
  }

  public async updateUserAccount(uaid: string, email: string) {
    this.validateUserUpdateData(email.toLowerCase());
    const existUserAccountWithUaid = await this.userRepository.getUserAccountBy(
      uaid,
    );
    if (
      !existUserAccountWithUaid ||
      existUserAccountWithUaid.user_activity_status !==
        UserActivityStatus.ACTIVE
    ) {
      throw new BadRequestException(USER_NOT_ACTIVE);
    }
    const existUserAccountWithEmail =
      await this.userRepository.getUserAccountBy(email.toLowerCase());
    if (!!existUserAccountWithEmail) {
      throw new BadRequestException(USER_EXIST);
    }
    await this.userRepository.updateUserAccount(email.toLowerCase(), uaid);
  }

  public async removeUserAccount(uaid: string) {
    const existUserAccountWithUaid = await this.userRepository.getUserAccountBy(
      uaid,
    );
    if (
      !existUserAccountWithUaid ||
      existUserAccountWithUaid.user_activity_status !==
        UserActivityStatus.ACTIVE
    ) {
      throw new BadRequestException(USER_NOT_ACTIVE);
    }
    const status = await this.userRepository.getActivityStatusCodeByStatus(
      UserActivityStatus.ARCHIVED,
    );
    await this.userRepository.removeUserAccount(uaid, status);
  }

  public async suspendUserAccount(uaid: string) {
    const existUserAccountWithUaid = await this.userRepository.getUserAccountBy(
      uaid,
    );
    if (
      !existUserAccountWithUaid ||
      existUserAccountWithUaid.user_activity_status !==
        UserActivityStatus.ACTIVE
    ) {
      throw new BadRequestException(USER_NOT_ACTIVE);
    }
    const status = await this.userRepository.getActivityStatusCodeByStatus(
      UserActivityStatus.SUSPENDED,
    );
    await this.userRepository.suspendUserAccount(uaid, status);
  }

  public async reactivateUserAccount(uaid: string) {
    const existUserAccountWithUaid = await this.userRepository.getUserAccountBy(
      uaid,
    );
    if (
      !existUserAccountWithUaid ||
      existUserAccountWithUaid.user_activity_status !==
        UserActivityStatus.SUSPENDED
    ) {
      throw new BadRequestException(USER_NOT_SUSPENDED);
    }
    const status = await this.userRepository.getActivityStatusCodeByStatus(
      UserActivityStatus.ACTIVE,
    );
    await this.userRepository.reactivateUserAccount(uaid, status);
  }
}
