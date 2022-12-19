import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CurrentUser, JwtAuthGuard, TicketEvent, User } from '@app/common';
import { TicketsService } from './tickets.service';
import { TicketDto } from './dto/ticketDto';
import { CreateOrderDto } from './dto/createOrderDto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ticketsService: TicketsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getOrders(@CurrentUser() user: User) {
    return this.ordersService.getAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getOrderById(@Param('id') orderId: string, @CurrentUser() user: User) {
    return this.ordersService.getOrder(orderId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  cancelOrder(@Param('id') orderId: string, @CurrentUser() user: User) {
    return this.ordersService.cancelOrder(orderId, user.id);
  }

  @Get('/tickets')
  getTickets() {
    return this.ticketsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @EventPattern(TicketEvent.Created)
  public async orderUpdatedHandler(
    @Payload() data: TicketDto,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ticketsService.createTicket(data, context);
  }
}
