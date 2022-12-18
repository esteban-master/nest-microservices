import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { JwtAuthGuard, TicketEvent } from '@app/common';
import { TicketsService } from './tickets.service';
import { TicketDto } from './dto/ticketDto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ticketsService: TicketsService,
  ) {}

  @Get()
  getOrders() {
    return this.ordersService.getAll();
  }

  @Get('/tickets')
  getTickets() {
    return this.ticketsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder() {
    return 'Creando...';
  }

  @EventPattern(TicketEvent.Created)
  public async orderUpdatedHandler(
    @Payload() data: TicketDto,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ticketsService.createTicket(data, context);
  }
}
