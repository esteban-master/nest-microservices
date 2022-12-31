import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { CustomStrategy } from '@nestjs/microservices';
import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(PaymentsModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const logger = new Logger();
  const options: CustomStrategy = {
    strategy: new NatsJetStreamServer({
      connectionOptions: {
        servers: [configService.get('NATS_URL')],
        name: 'payments-listener',
        connectedHook: async (nc) => {
          logger.log('Payments service connected to ' + nc.getServer());
        },
      },
      consumerOptions: {
        deliverGroup: 'payments-group',
        durable: 'payments-durable',
        deliverTo: 'payments-messages',
        manualAck: true,
        deliverPolicy: 'All',
      },
    }),
  };
  app.connectMicroservice(options).listen();
  await app.listen(3000);
}
bootstrap();
