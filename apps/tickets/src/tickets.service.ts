import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';

@Injectable()
export class TicketsService {
  constructor(private client: NatsJetStreamClient) {}

  async create(createTicketDto: CreateTicketDto) {
    this.client.emit('ticket.created', createTicketDto);
    return createTicketDto;
  }
}
