import { Injectable } from '@nestjs/common';
import { NatsOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class NatsService {
  getOptions(clientName: string): NatsOptions {
    return {
      transport: Transport.NATS,
      options: {
        servers: ['http://nats-srv:4222'],
        name: clientName,
      },
    };
  }
}
