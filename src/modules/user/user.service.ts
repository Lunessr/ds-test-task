import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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
import { PROCEDURES } from '../../constants/procedures';
import { USER_REPOSITORY } from '../../constants/providers';
import { User } from '../../entities/user.entity';
import { userMapper } from '../../mappers/user.mapper';
import { CreateUserDto } from './dto/create-user.dto';
import { UserActivityStatus } from '../../enums/user-activity-status';

@Injectable()
export class UserService {
  private schemaValidator: Validator;
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {
    this.schemaValidator = new Validator();
  }

  private validateUserCreatingData(createUserDto: CreateUserDto) {
    const userCreatingSchema = {
      type: 'object',
      properties: {
        full_name: { type: 'string', maxLength: 100 },
        birth_date: { type: 'string', format: 'date' },
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
    const userWithUaid = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${uaid}')`,
    );
    if (!!userWithUaid[0][0]) {
      await this.createRandomUaid();
    }
    return uaid;
  }

  public async addUserAccount(createUserDto: CreateUserDto) {
    this.validateUserCreatingData(createUserDto);
    const { full_name, birth_date, email } = createUserDto;

    const existUserAccount = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${email.toLowerCase()}')`,
    );
    if (!!existUserAccount[0][0]) {
      throw new BadRequestException(USER_EXIST);
    }
    const uaid = await this.createRandomUaid();
    const yearsRange =
      new Date().getFullYear() - new Date(birth_date).getFullYear();
    if (yearsRange < 18) {
      throw new BadRequestException(NOT_VALID_AGE);
    }
    const status = await this.userRepository.query(
      `${PROCEDURES.GET_USER_STATUS_CODE_BY_STATUS}('${UserActivityStatus.ACTIVE}')`,
    );
    await this.userRepository.query(
      `${
        PROCEDURES.ADD_USER_ACCOUNT
      }('${full_name}', '${birth_date}', '${email.toLowerCase()}', '${uaid}', ${
        status[0][0].id
      })`,
    );
    const userAccount = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${uaid}')`,
    );
    return userMapper(userAccount[0][0]);
  }

  public async getAllUsers() {
    const users = await this.userRepository.query(
      `${PROCEDURES.GET_ALL_USERS}`,
    );
    if (!users[0][0]) {
      throw new BadRequestException(USERS_NOT_FOUND);
    }
    return users[0].map(user => userMapper(user));
  }

  public async updateUserAccount(uaid: string, email: string) {
    this.validateUserUpdateData(email);
    const existUserAccountWithUaid = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${uaid}')`,
    );
    if (
      !existUserAccountWithUaid[0][0] ||
      existUserAccountWithUaid[0][0].user_activity_status !==
        UserActivityStatus.ACTIVE
    ) {
      throw new BadRequestException(USER_NOT_ACTIVE);
    }
    const existUserAccountWithEmail = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${email}')`,
    );
    if (!!existUserAccountWithEmail[0][0]) {
      throw new BadRequestException(USER_EXIST);
    }
    await this.userRepository.query(
      `${PROCEDURES.UPDATE_USER_ACCOUNT}('${email}', '${uaid}')`,
    );
  }

  public async removeUserAccount(uaid: string) {
    const existUserAccountWithUaid = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${uaid}')`,
    );
    if (
      !existUserAccountWithUaid[0][0] ||
      existUserAccountWithUaid[0][0].user_activity_status !==
        UserActivityStatus.ACTIVE
    ) {
      throw new BadRequestException(USER_NOT_ACTIVE);
    }
    const status = await this.userRepository.query(
      `${PROCEDURES.GET_USER_STATUS_CODE_BY_STATUS}('${UserActivityStatus.ARCHIVED}')`,
    );
    await this.userRepository.query(
      `${PROCEDURES.REMOVE_USER_ACCOUNT}('${uaid}', ${status[0][0].id})`,
    );
  }

  public async suspendUserAccount(uaid: string) {
    const existUserAccountWithUaid = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${uaid}')`,
    );
    if (
      !existUserAccountWithUaid[0][0] ||
      existUserAccountWithUaid[0][0].user_activity_status !==
        UserActivityStatus.ACTIVE
    ) {
      throw new BadRequestException(USER_NOT_ACTIVE);
    }
    const status = await this.userRepository.query(
      `${PROCEDURES.GET_USER_STATUS_CODE_BY_STATUS}('${UserActivityStatus.SUSPENDED}')`,
    );
    await this.userRepository.query(
      `${PROCEDURES.SUSPEND_USER_ACCOUNT}('${uaid}', ${status[0][0].id})`,
    );
  }

  public async reactivateUserAccount(uaid: string) {
    const existUserAccountWithUaid = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${uaid}')`,
    );
    if (
      !existUserAccountWithUaid[0][0] ||
      existUserAccountWithUaid[0][0].user_activity_status !==
        UserActivityStatus.SUSPENDED
    ) {
      throw new BadRequestException(USER_NOT_SUSPENDED);
    }
    const status = await this.userRepository.query(
      `${PROCEDURES.GET_USER_STATUS_CODE_BY_STATUS}('${UserActivityStatus.ACTIVE}')`,
    );
    await this.userRepository.query(
      `${PROCEDURES.REACTIVATE_USER_ACCOUNT}('${uaid}', ${status[0][0].id})`,
    );
  }
}
