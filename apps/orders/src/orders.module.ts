import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './models/ticket';
import { Order, Orderchema } from './models/order';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NatsModule } from '@app/common/nats/nats.module';

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
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['http://nats-srv:4222'],
          name: 'ticketing',
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
