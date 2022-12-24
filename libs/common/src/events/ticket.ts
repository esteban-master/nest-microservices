export const TicketEvent = {
  Created: 'ticket.created',
};

export type CreateTicketPayloadEvent = {
  id: string;
  title: string;
  price: number;
};
