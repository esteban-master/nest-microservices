import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketEvent } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from './models/tickets';
import { Model } from 'mongoose';
import { EditTicketDto } from './dto/editTicketDto';

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

  async edit(ticketId: string, editeTicketDto: EditTicketDto) {
    try {
      const ticket = await this.ticketModel.findOneAndUpdate(
        { _id: ticketId },
        editeTicketDto,
        { new: true },
      );

      this.client.emit(TicketEvent.Updated, ticket);
      return ticket;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
