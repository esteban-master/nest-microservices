import { NestFactory } from '@nestjs/core';
import { ExpirationModule } from './expiration.module';
import { Logger } from '@nestjs/common';
import { CustomStrategy, MicroserviceOptions } from '@nestjs/microservices';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

async function bootstrap() {
  const logger = new Logger();
  const options: CustomStrategy = {
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: ['http://nats-srv:4222'],
        name: 'expiration-listener',
        connectedHook: async (nc) => {
          logger.log('Expiration service connected to ' + nc.getServer());
        },
      },
      consumerOptions: {
        deliverGroup: 'expiration-group',
        durable: 'expiration-durable',
        deliverTo: 'expiration-messages',
        manualAck: true,
        deliverPolicy: 'All',
      },
      streamConfig: {
        name: 'expiration_stream',
        subjects: ['order.*'],
      },
    }),
  };
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ExpirationModule,
    options,
  );
  await app.listen();
}
bootstrap();
