// import { JwtAuthGuard } from '@app/common';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders() {
    return this.ordersService.getAll();
  }

  @EventPattern('ticket.created')
  public async orderUpdatedHandler(
    @Payload() data: string,
    @Ctx() context: NatsJetStreamContext,
  ) {
    context.message.ack();
    console.log('Recibido desde ORDER: ' + context.message.subject, data);
  }
}
