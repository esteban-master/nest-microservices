import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './models/order';
import { CreateOrderDto } from './dto/createOrderDto';
import { TicketsService } from './tickets.service';
import { ExpirationPayloadEvent, OrderStatus, User } from '@app/common';
import {
  NatsJetStreamClient,
  NatsJetStreamContext,
} from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  CancelledOrderPayloadEvent,
  CreateOrderPayloadEvent,
  OrderEvent,
} from '@app/common/events/order';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly ticketService: TicketsService,
    private natsClient: NatsJetStreamClient,
  ) {}

  async getAll(userId: string): Promise<Order[]> {
    return await this.orderModel.find({
      userId,
    });
  }

  async create({ ticketId }: CreateOrderDto, user: User) {
    const ticket = await this.ticketService.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    const ticketIsReserved = await this.orderModel.findOne({
      ticket: ticket._id,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    });

    if (ticketIsReserved) {
      throw new BadRequestException('Ticket is already reserved');
    }

    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + 0.5 * 60);
      const newOrder = new this.orderModel({
        userId: user.id,
        ticket,
        expiresAt,
        status: OrderStatus.Created,
      });

      await newOrder.save();

      this.natsClient.emit<CreateOrderPayloadEvent>(OrderEvent.Created, {
        id: newOrder.id,
        status: newOrder.status,
        expiresAt: newOrder.expiresAt.toISOString(),
        userId: newOrder.userId.toString(),
        version: newOrder.version,
        ticket: {
          id: ticket.id,
          price: ticket.price,
        },
      });
      return newOrder;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    try {
      const order = await this.getOrder(orderId);
      if (this.isTheSameUser(order, userId)) {
        order.status = OrderStatus.Cancelled;
        await order.save();
        this.natsClient.emit<CancelledOrderPayloadEvent>(OrderEvent.Cancelled, {
          id: order.id,
          version: order.version,
          ticket: { id: order.ticket.toString() },
        });
        return order;
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async expirationOrder(
    { orderId }: ExpirationPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    const order = await this.getOrder(orderId);
    order.status = OrderStatus.Cancelled;
    await order.save();

    this.natsClient.emit<CancelledOrderPayloadEvent>(OrderEvent.Cancelled, {
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.toString() },
    });

    context.message.ack();
  }

  async getOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }

  async isTheSameUser(order: Order, userId: string) {
    if (order.userId.toString() !== userId.toString()) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
