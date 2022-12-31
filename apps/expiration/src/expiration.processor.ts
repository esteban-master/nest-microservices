import { ExpirationEvent } from '@app/common';
import { OrderEvent } from '@app/common/events/order';
import { NatsJetStreamClient } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('order.expiration')
export class ExpirationConsumer {
  private readonly logger = new Logger(ExpirationConsumer.name);

  constructor(private natsClient: NatsJetStreamClient) {}

  @Process(OrderEvent.Created)
  async handleExpiration(job: Job<{ orderId: string }>) {
    this.logger.debug('Expiration order');
    this.logger.debug(job.data);
    this.natsClient.emit(ExpirationEvent.Expiration, job.data);
  }
}
