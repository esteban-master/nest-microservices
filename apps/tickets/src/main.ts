import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketsModule } from './tickets.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule);
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<NatsOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['http://nats-srv:4222'],
      queue: 'auth-queue',
    },
  });

  app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
