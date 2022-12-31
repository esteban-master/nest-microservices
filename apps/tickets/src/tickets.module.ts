import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './models/tickets';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  NatsJetStreamTransport,
  NatsJetStreamClient,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        NATS_URL: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    NatsJetStreamTransport.register({
      connectionOptions: {
        servers: ['http://nats-srv:4222'],
        name: 'tickets-publisher',
        connectedHook: (nc) =>
          console.log('Ticket service publisher connected to ', nc.getServer()),
      },
    }),
    ClientsModule.register([
      {
        name: 'AUTH',
        transport: Transport.NATS,
        options: {
          servers: ['http://nats-srv:4222'],
        },
      },
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, NatsJetStreamClient],
})
export class TicketsModule {}
