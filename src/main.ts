import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorExceptionsFilter } from './errors/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
