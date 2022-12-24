import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    editTicket: EditTicketPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    try {
      const ticket = await this.ticketModel.findOne({
        _id: editTicket.id,
        version: editTicket.version - 1,
      });

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      const { title, price, version } = editTicket;
      ticket.set({ title, price, version });
      await ticket.save();

      context.message.ack();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findById(id: string) {
    return await this.ticketModel.findById(id);
  }
}
