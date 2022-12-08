import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PROCEDURES } from '../../constants/procedures';
import { USER_REPOSITORY } from '../../constants/providers';
import { ActivityStatusCode } from '../../entities/activity-status-code.entity';
import { User } from '../../entities/user.entity';
import { UserActivityStatus } from '../../enums/user-activity-status';
import { IUser } from './interfaces/user';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}

  public async addUserAccount(
    fullName: string,
    birthDate: string,
    email: string,
    uaid: string,
    status: ActivityStatusCode,
  ): Promise<void> {
    await this.userRepository.query(
      `${
        PROCEDURES.ADD_USER_ACCOUNT
      }('${fullName}', '${birthDate}', '${email.toLowerCase()}', '${uaid}', ${
        status.id
      })`,
    );
  }

  public async getUserAccountBy(value: string): Promise<IUser> {
    const userAccount = await this.userRepository.query(
      `${PROCEDURES.GET_USER_BY}('${value}')`,
    );
    return userAccount[0][0];
  }

  public async getAllUserAccounts(): Promise<IUser[]> {
    const users = await this.userRepository.query(
      `${PROCEDURES.GET_ALL_USERS}`,
    );
    return users[0];
  }

  public async updateUserAccount(email: string, uaid: string): Promise<void> {
    await this.userRepository.query(
      `${PROCEDURES.UPDATE_USER_ACCOUNT}('${email}', '${uaid}')`,
    );
  }

  public async removeUserAccount(
    uaid: string,
    status: ActivityStatusCode,
  ): Promise<void> {
    await this.userRepository.query(
      `${PROCEDURES.REMOVE_USER_ACCOUNT}('${uaid}', ${status.id})`,
    );
  }

  public async suspendUserAccount(
    uaid: string,
    status: ActivityStatusCode,
  ): Promise<void> {
    await this.userRepository.query(
      `${PROCEDURES.SUSPEND_USER_ACCOUNT}('${uaid}', ${status.id})`,
    );
  }

  public async reactivateUserAccount(
    uaid: string,
    status: ActivityStatusCode,
  ): Promise<void> {
    await this.userRepository.query(
      `${PROCEDURES.REACTIVATE_USER_ACCOUNT}('${uaid}', ${status.id})`,
    );
  }

  public async getActivityStatusCodeByStatus(
    userActivityStatus: UserActivityStatus,
  ): Promise<ActivityStatusCode> {
    const status = await this.userRepository.query(
      `${PROCEDURES.GET_USER_STATUS_CODE_BY_STATUS}('${userActivityStatus}')`,
    );
    return status[0][0];
  }
}
