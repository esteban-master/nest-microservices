// import {
//   NatsJetStreamClient,
//   NatsJetStreamTransport,
// } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  NatsJetStreamClient,
  NatsJetStreamTransport,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { AUTH } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    // NatsJetStreamTransport.register({
    //   connectionOptions: {
    //     servers: ['http://nats-srv:4222'],
    //     name: 'auth-service',
    //     connectedHook: (nc) =>
    //       console.log('AUTH connected to ', nc.getServer()),
    //   },
    // }),
    ClientsModule.register([
      {
        name: AUTH,
        transport: Transport.NATS,
        options: {
          servers: ['http://nats-srv:4222'],
          queue: 'auth-queue',
        },
      },
    ]),
  ],
  exports: [],
  providers: [],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
