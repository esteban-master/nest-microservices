import { Module } from '@nestjs/common';
import { ExpirationController } from './expiration.controller';
import { ExpirationService } from './expiration.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  NatsJetStreamClient,
  NatsJetStreamTransport,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        NATS_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
      }),
    }),
    NatsJetStreamTransport.register({
      connectionOptions: {
        servers: 'http://nats-srv:4222',
        name: 'expiration-publisher',
      },
    }),
  ],
  controllers: [ExpirationController],
  providers: [ExpirationService, NatsJetStreamClient],
})
export class ExpirationModule {}
