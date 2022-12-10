import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';

@Injectable()
export class TicketsService {
  async create(createTicketDto: CreateTicketDto) {
    return createTicketDto;
  }
}
