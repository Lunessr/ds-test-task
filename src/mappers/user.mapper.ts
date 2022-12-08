import { UserResponseDto } from '../modules/user/dto/user-response.dto';
import { IUser } from '../modules/user/interfaces/user';

export const userMapper = (user: IUser): UserResponseDto => {
  return {
    id: user.uaid,
    fullName: user.full_name,
    birthDate: new Date(user.birth_date).toLocaleDateString(),
    email: user.email,
    activityStatus: user.user_activity_status,
  };
};
