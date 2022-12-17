import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, tap } from 'rxjs';
import { CreateTicketDto } from './dto/createTicketDto';

@Injectable()
export class TicketsService {
  constructor(
    private client: NatsJetStreamClient,
    @Inject('TICKET_SERVICE') private ticketClient: ClientProxy,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    this.client.emit('ticket.created', createTicketDto).subscribe({
      next: (p) => console.log('PubAck', p),
      error: (err) => console.log(err),
      complete: () => console.log('Complete'),
    });
    return createTicketDto;
  }

  async create2() {
    return this.client
      .send('validate_user', {
        Authentication: 'JAJAJAJAJAJAJAJAJAJAJJAAJJAAJ',
      })
      .pipe(
        tap((res) => {
          console.log(res);
        }),
        // catchError(() => {
        //   throw new UnauthorizedException('Poto sucio');
        // }),
      )
      .subscribe({
        next: (res) => console.log(res),
        error: (err) => console.log({ err }),
        complete: () => console.log('Completeeeee'),
      });
  }
}
