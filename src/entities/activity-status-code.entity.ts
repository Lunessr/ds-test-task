import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { UserActivityStatus } from '../enums/user-activity-status';
import { User } from './user.entity';

@Entity({ name: 'user_status_code' })
export class ActivityStatusCode extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'user_activity_status',
    type: 'enum',
    enum: UserActivityStatus,
  })
  userActivityStatus: UserActivityStatus;

  @OneToMany(() => User, user => user.activityStatus)
  users: User[];
}
