import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { NatsOptions, Transport } from '@nestjs/microservices';
// import { CustomStrategy, NatsOptions, Transport } from '@nestjs/microservices';
// import { DebugEvents } from 'nats';
// import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
// import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
// import { DebugEvents } from 'nats';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());

  // const logger = new Logger();
  // const options: CustomStrategy = {
  //   strategy: new NatsJetStreamServer({
  //     connectionOptions: {
  //       servers: ['http://nats-srv:4222'],
  //       name: 'auth-listener',
  //       connectedHook: async (nc) => {
  //         logger.log('Connected to ' + nc.getServer());
  //         for await (const s of nc.status()) {
  //           if (s.type == DebugEvents.PingTimer) {
  //             console.log('We got ping timer attempt: ' + s.data);
  //           }
  //         }
  //       },
  //     },
  //     consumerOptions: {
  //       deliverGroup: 'auth-group',
  //       durable: 'auth-durable',
  //       deliverTo: 'auth-messages',
  //       manualAck: false,
  //     },
  //     streamConfig: {
  //       name: 'auth',
  //       subjects: ['auth.*'],
  //     },
  //   }),
  // };
  // const microservice = app.connectMicroservice(options);
  // microservice.listen();
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
