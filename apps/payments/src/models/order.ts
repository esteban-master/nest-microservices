import { OrderStatus } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order> & { version: number };

@Schema({
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  versionKey: 'version',
})
export class Order extends Document {
  @Prop({
    required: true,
    enum: Object.values(OrderStatus),
  })
  status: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  userId: string;
}

export const Orderchema = SchemaFactory.createForClass(Order);
