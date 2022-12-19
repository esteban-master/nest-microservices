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
import { OrderStatus, User } from '@app/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly ticketService: TicketsService,
  ) {}

  async getAll(userId: string): Promise<Order[]> {
    return await this.orderModel.find({
      userId,
    });
  }

  async getOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException();
    }

    if (order.userId.toString() !== userId.toString()) {
      throw new UnauthorizedException();
    }
    return order;
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
      expiresAt.setSeconds(expiresAt.getSeconds() + 15 * 60);
      const newOrder = new this.orderModel({
        userId: user.id,
        ticket,
        expiresAt,
        status: OrderStatus.Created,
      });

      await newOrder.save();
      return newOrder;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.getOrder(orderId, userId);
    order.status = OrderStatus.Cancelled;
    await order.save();
    return order;
  }
}
