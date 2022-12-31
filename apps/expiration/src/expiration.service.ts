import { CreateOrderPayloadEvent, OrderEvent } from '@app/common/events';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ExpirationService {
  constructor(
    @InjectQueue('order.expiration') private orderExpirationQueue: Queue,
  ) {}

  async handleExpiration(
    data: CreateOrderPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await this.orderExpirationQueue.add(
      OrderEvent.Created,
      {
        orderId: data.id,
      },
      { delay: delay },
    );
    context.message.ack();
  }
}
