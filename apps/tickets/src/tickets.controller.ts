import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '@app/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { CreateOrderPayloadEvent, OrderEvent } from '@app/common/events/order';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @EventPattern(OrderEvent.Created)
  orderCreatedEvent(
    @Payload() data: CreateOrderPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    console.log('Evento recibido', data, context.message.ack());
  }

  @Get()
  getTickets() {
    return this.ticketsService.getAll();
  }
}
