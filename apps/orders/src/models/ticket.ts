import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type TicketsDocument = HydratedDocument<Ticket>;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Ticket extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  price: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
