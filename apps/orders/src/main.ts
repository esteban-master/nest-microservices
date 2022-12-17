import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DebugEvents } from 'nats';
import { OrdersModule } from './orders.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(OrdersModule);
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
          for await (const s of nc.status()) {
            if (s.type == DebugEvents.PingTimer) {
              console.log('We got ping timer attempt: ' + s.data);
            }
          }
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
        name: 'tickets_stream',
        subjects: ['ticket.*'],
      },
    }),
  };
  const microservice = app.connectMicroservice(options);
  microservice.listen();
  await app.listen(3000);
}
bootstrap();
