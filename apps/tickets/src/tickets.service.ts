import {
  NatsJetStreamClient,
  NatsJetStreamContext,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketEvent } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from './models/tickets';
import { Model } from 'mongoose';
import { EditTicketDto } from './dto/editTicketDto';
import { CreateOrderPayloadEvent } from '@app/common/events/order';

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
    try {
      const ticket = await this.ticketModel.findById(ticketId);
      ticket.set(editTicketDto);
      ticket.version += 1;
      await ticket.save();

      this.client.emit(TicketEvent.Updated, ticket);
      return ticket;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async orderCreatedEvent(
    orderCreatedEvent: CreateOrderPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    try {
      const ticket = await this.ticketModel.findById(
        orderCreatedEvent.ticket.id,
      );

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      ticket.orderId = orderCreatedEvent.id;
      await ticket.save();
      context.message.ack();
    } catch (error) {}
  }
}
