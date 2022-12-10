import { CurrentUser } from '@app/common';
import { Body, Controller, Post } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
// import { JwtAuthGuard } from 'apps/auth/src/guards/jwtAuth.guard';
import { User } from 'apps/auth/src/models/user';
import { CreateTicketDto } from './dto/createTicketDto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  signup(@CurrentUser() user: User, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @EventPattern('ticket:created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: NatsContext) {
    console.log("JAJAJAJAJ", context, data)
  }
}
