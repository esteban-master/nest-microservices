import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketsModule } from './tickets.module';
import * as cookieParser from 'cookie-parser';
import { CustomStrategy } from '@nestjs/microservices';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());

  const logger = new Logger();
  const options: CustomStrategy = {
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: ['http://nats-srv:4222'],
        name: 'tickets-listener',
        connectedHook: async (nc) => {
          logger.log('Tickets service connected to ' + nc.getServer());
        },
      },
      consumerOptions: {
        deliverGroup: 'tickets-group',
        durable: 'tickets-durable',
        deliverTo: 'tickets-messages',
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
