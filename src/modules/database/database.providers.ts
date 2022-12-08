import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../constants/providers';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'test',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: ['dist/modules/database/migrations/**{.ts,.js}'],
        synchronize: false,
        logging: true,
      });

      return dataSource.initialize();
    },
  },
];
