import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import {
  CancelledOrderPayloadEvent,
  CreateOrderPayloadEvent,
  CurrentUser,
  JwtAuthGuard,
  OrderEvent,
  User,
} from '@app/common';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { OrdersService } from './orders.service';
import { PaymentDto } from './dto/paymentDto';
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPayments(
    @CurrentUser() user: User,
    @Body() paymentDto: PaymentDto,
  ) {
    return this.paymentsService.payment(user, paymentDto);
  }

  @Get('/orders')
  orders() {
    return this.ordersService.getAll();
  }

  @EventPattern(OrderEvent.Created)
  orderCreatedEvent(
    @Payload() data: CreateOrderPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ordersService.create(data, context);
  }

  @EventPattern(OrderEvent.Cancelled)
  orderCancelledEvent(
    @Payload() data: CancelledOrderPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ordersService.cancelOrder(data, context);
  }
}
