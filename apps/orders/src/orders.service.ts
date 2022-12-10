import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './models/order';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDER_SERVICE') private orderServiceClient: ClientProxy,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getAll(): Promise<Order[]> {
    this.orderServiceClient
      .emit('order:created', 'hola')
      .subscribe((item) => console.log(item));
    console.log('EMITTTTT');
    return await this.orderModel.find({});
  }
}
