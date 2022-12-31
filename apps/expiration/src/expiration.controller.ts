import { Controller } from '@nestjs/common';
import { ExpirationService } from './expiration.service';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { CreateOrderPayloadEvent, OrderEvent } from '@app/common/events/order';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Controller()
export class ExpirationController {
  constructor(private readonly expirationService: ExpirationService) {}

  @EventPattern(OrderEvent.Created)
  orderCreatedEvent(
    @Payload() data: CreateOrderPayloadEvent,
    @Ctx() context: NatsJetStreamContext,
  ) {
    this.expirationService.handleExpiration(data, context);
  }
}
