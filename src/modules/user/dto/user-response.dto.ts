import { ActivityStatusCode } from '../../../entities/activity-status-code.entity';

export class UserResponseDto {
  id: string;
  full_name: string;
  birth_date: string;
  email: string;
  activity_status: ActivityStatusCode;
}
