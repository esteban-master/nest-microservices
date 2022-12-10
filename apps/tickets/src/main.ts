import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketsModule } from './tickets.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule);
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
