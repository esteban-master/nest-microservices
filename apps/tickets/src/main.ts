import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketsModule } from './tickets.module';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
