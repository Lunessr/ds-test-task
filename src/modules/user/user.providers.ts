import { DataSource } from 'typeorm';
import { DATA_SOURCE, USER_REPOSITORY } from '../../constants/providers';
import { User } from '../../entities/user.entity';

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];
