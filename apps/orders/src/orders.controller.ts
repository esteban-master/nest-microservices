import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import {
  CreateTicketPayloadEvent,
  CurrentUser,
  EditTicketPayloadEvent,
  ExpirationEvent,
  ExpirationPayloadEvent,
  JwtAuthGuard,
  TicketEvent,
  User,
} from '@app/common';
import { TicketsService } from './tickets.service';
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

  @Get('/tickets')
  getTickets() {
    return this.ticketsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getOrderById(@Param('id') orderId: string, @CurrentUser() user: User) {
    const order = await this.ordersService.getOrder(orderId);
    this.ordersService.isTheSameUser(order, user.id);
    return order;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  cancelOrder(@Param('id') orderId: string, @CurrentUser() user: User) {
    return this.ordersService.cancelOrder(orderId, user.id);
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
  public async ticketCreatedEvent(
    @Payload() data: CreateTicketPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ticketsService.createTicket(data, context);
  }

  @EventPattern(TicketEvent.Updated)
  public async updatedCreatedEvent(
    @Payload() data: EditTicketPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ticketsService.updateTicket(data, context);
  }

  @EventPattern(ExpirationEvent.Expiration)
  public async expirationOrderEvent(
    @Payload() data: ExpirationPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.ordersService.expirationOrder(data, context);
  }
}
