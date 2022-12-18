import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '@app/common';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  getTickets() {
    return this.ticketsService.getAll();
  }
}
