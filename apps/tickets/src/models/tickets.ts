import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type TicketDocument = HydratedDocument<Ticket> & { version: number };

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
export class Ticket extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  orderId?: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
