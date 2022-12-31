import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, Orderchema } from './models/order';
import { OrdersService } from './orders.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    MongooseModule.forFeature([{ name: Order.name, schema: Orderchema }]),
    ClientsModule.registerAsync([
      {
        name: 'AUTH',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [configService.get('NATS_URL')],
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, OrdersService],
})
export class PaymentsModule {}
