// import { CurrentUser } from '@app/common';
// import { CurrentUser, JwtAuthGuard } from '@app/common';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { User } from 'apps/auth/src/models/user';
// import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
// import { JwtAuthGuard } from 'apps/auth/src/guards/jwtAuth.guard';
// import { User } from 'apps/auth/src/models/user';
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
  @Post('/dos')
  createTicket2() {
    // console.log("JAJAJAJAJAAJ POTPPPP", user)
    // return true
    // return this.ticketsService.create2();
  }
}
