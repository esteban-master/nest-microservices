import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketDocument } from 'apps/tickets/src/models/tickets';
import { Ticket } from './models/ticket';
import { CreateTicketPayloadEvent, EditTicketPayloadEvent } from '@app/common';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async getAll(): Promise<Ticket[]> {
    return await this.ticketModel.find({});
  }

  async createTicket(
    ticket: CreateTicketPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    try {
      const newTicket = new this.ticketModel({ ...ticket, _id: ticket.id });
      await newTicket.save();
      context.message.ack();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateTicket(
    ticket: EditTicketPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    try {
      await this.ticketModel.updateOne(
        { _id: ticket.id },
        {
          title: ticket.title,
          price: ticket.price,
        },
      );
      context.message.ack();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findById(id: string) {
    return await this.ticketModel.findById(id);
  }
}