import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OrdersModule } from './orders.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(OrdersModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  const logger = new Logger();
  const options: CustomStrategy = {
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: [configService.get('NATS_URL')],
        name: 'orders-listener',
        connectedHook: async (nc) => {
          logger.log('Orders service connected to ' + nc.getServer());
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
        subjects: ['order.*', 'expiration.*'],
      },
    }),
  };
  const microservice = app.connectMicroservice(options);
  microservice.listen();
  await app.listen(3000);
}
bootstrap();
