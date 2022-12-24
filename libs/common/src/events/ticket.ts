export const TicketEvent = {
  Created: 'ticket.created',
  Updated: 'ticket.updated',
};

export type CreateTicketPayloadEvent = {
  id: string;
  title: string;
  price: number;
};

export type EditTicketPayloadEvent = CreateTicketPayloadEvent;
