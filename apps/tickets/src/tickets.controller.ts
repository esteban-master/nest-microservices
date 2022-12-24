import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '@app/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import {
  CancelledOrderPayloadEvent,
  CreateOrderPayloadEvent,
  OrderEvent,
} from '@app/common/events/order';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { EditTicketDto } from './dto/editTicketDto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  updateTicket(
    @Param('id') ticketId: string,
    @Body() editTicketDto: EditTicketDto,
  ) {
    return this.ticketsService.edit(ticketId, editTicketDto);
  }

  @EventPattern(OrderEvent.Created)
  orderCreatedEvent(
    @Payload() data: CreateOrderPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    console.log('Order recibida', data);
    context.message.ack();
  }

  @EventPattern(OrderEvent.Cancelled)
  orderCancelledEvent(
    @Payload() data: CancelledOrderPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    console.log('Order cancelada recibida', data);
    context.message.ack();
  }

  @Get()
  getTickets() {
    return this.ticketsService.getAll();
  }
}
