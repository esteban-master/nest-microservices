import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketEvent } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from './models/tickets';
import { Model } from 'mongoose';

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
}
