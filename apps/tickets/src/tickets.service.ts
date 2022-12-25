import {
  NatsJetStreamClient,
  NatsJetStreamContext,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketEvent } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from './models/tickets';
import { Model } from 'mongoose';
import { EditTicketDto } from './dto/editTicketDto';
import {
  CancelledOrderPayloadEvent,
  CreateOrderPayloadEvent,
} from '@app/common/events/order';

@Injectable()
export class TicketsService {
  constructor(
    private client: NatsJetStreamClient,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async getAll() {
    return await this.ticketModel.find({});
  }

  async create(createTicketDto: CreateTicketDto) {
    try {
      const newTicket = new this.ticketModel(createTicketDto);
      await newTicket.save();

      this.client.emit(TicketEvent.Created, newTicket);
      return newTicket;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async edit(ticketId: string, editTicketDto: EditTicketDto) {
    const ticket = await this.findTicketById(ticketId);

    if (ticket.orderId) {
      throw new BadRequestException('Cannot edit a reserved ticket');
    }

    try {
      ticket.set(editTicketDto);
      await ticket.save();

      this.client.emit(TicketEvent.Updated, ticket);
      return ticket;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async orderCreatedEvent(
    data: CreateOrderPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    const ticket = await this.findTicketById(data.ticket.id);
    try {
      ticket.orderId = data.id;
      await ticket.save();
      context.message.ack();
      this.client.emit(TicketEvent.Updated, ticket);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async orderCancelledEvent(
    data: CancelledOrderPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    const ticket = await this.findTicketById(data.ticket.id);
    try {
      ticket.orderId = undefined;
      await ticket.save();
      context.message.ack();
      this.client.emit(TicketEvent.Updated, ticket);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async findTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }
}
