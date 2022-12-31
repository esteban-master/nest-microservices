import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './models/order';
import { Model } from 'mongoose';
import {
  CancelledOrderPayloadEvent,
  CreateOrderPayloadEvent,
  OrderStatus,
} from '@app/common';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getAll(): Promise<Order[]> {
    return await this.orderModel.find({});
  }

  async create(data: CreateOrderPayloadEvent, context: NatsJetStreamContext) {
    try {
      const order = new this.orderModel({
        _id: data.id,
        price: data.ticket.price,
        userId: data.userId,
        status: data.status,
        version: data.version,
      });

      await order.save();
      context.message.ack();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async cancelOrder(
    data: CancelledOrderPayloadEvent,
    context: NatsJetStreamContext,
  ) {
    try {
      const order = await this.orderModel.findOne({
        _id: data.id,
        version: data.version - 1,
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      order.status = OrderStatus.Cancelled;
      order.version = data.version;
      await order.save();
      context.message.ack();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }
}
