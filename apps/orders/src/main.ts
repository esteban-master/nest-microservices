import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OrdersModule } from './orders.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(OrdersModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());
  const logger = new Logger();
  const options: CustomStrategy = {
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: ['http://nats-srv:4222'],
        name: 'orders-listener',
        connectedHook: async (nc) => {
          logger.log('Connected to ' + nc.getServer());
        },
      },
      consumerOptions: {
        deliverGroup: 'orders-group',
        durable: 'orders-durable',
        deliverTo: 'orders-messages',
        manualAck: true,
        deliverPolicy: 'All',
      },
      streamConfig: {
        name: 'orders_stream',
        subjects: ['ticket.*'],
      },
    }),
  };
  const microservice = app.connectMicroservice(options);
  microservice.listen();
  await app.listen(3000);
}
bootstrap();
