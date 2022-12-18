import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import { CustomStrategy, NatsOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketsModule } from './tickets.module';
import * as cookieParser from 'cookie-parser';
// import { NatsJetStreamServer } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TicketsModule);
  app.use(cookieParser());
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());

  // const logger = new Logger();
  // const options: CustomStrategy = {
  //   strategy: new NatsJetStreamServer({
  //     connectionOptions: {
  //       servers: ['http://nats-srv:4222'],
  //       name: 'ticket-listener',
  //       connectedHook: async (nc) => {
  //         logger.log('Connected to ' + nc.getServer());
  //       },
  //     },
  //     consumerOptions: {},
  //   }),
  // };
  // const microservice = app.connectMicroservice(options);
  // microservice.listen();
  await app.listen(3000);
}
bootstrap();
