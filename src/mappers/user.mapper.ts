import { UserResponseDto } from '../modules/user/dto/user-response.dto';

export const userMapper = (user): UserResponseDto => {
  return {
    id: user.uaid,
    full_name: user.full_name,
    birth_date: new Date(user.birth_date).toLocaleDateString(),
    email: user.email,
    activity_status: user.user_activity_status,
  };
};
