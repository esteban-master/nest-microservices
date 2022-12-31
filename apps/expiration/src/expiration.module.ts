import { Module } from '@nestjs/common';
import { ExpirationController } from './expiration.controller';
import { ExpirationService } from './expiration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { BullModule } from '@nestjs/bull';
import { ExpirationConsumer } from './expiration.processor';
import {
  NatsJetStreamClient,
  NatsJetStreamTransport,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Queues } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        NATS_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    NatsJetStreamTransport.register({
      connectionOptions: {
        servers: 'http://nats-srv:4222',
        name: 'expiration-publisher',
      },
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: Queues.OrderExpiration,
    }),
  ],
  controllers: [ExpirationController],
  providers: [ExpirationService, ExpirationConsumer, NatsJetStreamClient],
})
export class ExpirationModule {}
