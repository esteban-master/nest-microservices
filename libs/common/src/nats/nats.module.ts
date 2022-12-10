import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { NatsService } from './nats.service';

@Module({
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule {
  static register(
    injectionTokenName: string,
    clientName: string,
  ): DynamicModule {
    return {
      module: NatsModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: injectionTokenName,
            useFactory: () => ({
              transport: Transport.NATS,
              options: {
                servers: ['http://nats-srv:4222'],
                name: clientName,
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
