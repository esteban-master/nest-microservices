import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { NatsOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<NatsOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['http://nats-srv:4222'],
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
