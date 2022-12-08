import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityStatusCode } from './activity-status-code.entity';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    name: 'full_name',
    type: 'varchar',
    collation: 'utf8mb4_unicode_ci',
    length: 100,
  })
  fullName: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ name: 'email', type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ name: 'uaid', type: 'varchar', length: 24, unique: true })
  uaid: string;

  @ManyToOne(
    () => ActivityStatusCode,
    activityStatusCode => activityStatusCode.users,
  )
  @JoinColumn({ name: 'activity_status' })
  activityStatus: ActivityStatusCode;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
