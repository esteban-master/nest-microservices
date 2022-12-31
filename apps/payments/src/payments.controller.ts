import { Controller, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { CancelledOrderPayloadEvent, CreateOrderPayloadEvent, OrderEvent } from '@app/common';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { OrdersService } from './orders.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService
  ) {}

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
