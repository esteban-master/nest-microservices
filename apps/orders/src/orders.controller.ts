import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders() {
    return this.ordersService.getAll();
  }

  @EventPattern('ticket:created')
  async handleUserCreated(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log(data, context.getSubject());
    return 'Nada';
  }
}
