import { OrderStatus } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order> & { version: number };

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  optimisticConcurrency: true,
  versionKey: 'version',
})
export class Order extends Document {
  @Prop({
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created,
  })
  status: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ticket' })
  ticket: Types.ObjectId;
}

export const Orderchema = SchemaFactory.createForClass(Order);
