import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './models/ticket';
import { Order, Orderchema } from './models/order';
import {
  NatsJetStreamClient,
  NatsJetStreamTransport,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: Orderchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    NatsJetStreamTransport.register({
      connectionOptions: {
        servers: 'http://nats-srv:4222',
        name: 'tickets-publisher',
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
  controllers: [OrdersController],
  providers: [OrdersService, TicketsService, NatsJetStreamClient],
})
export class OrdersModule {}
