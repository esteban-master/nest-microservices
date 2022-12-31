export const OrderEvent = {
  Created: 'order.created',
  Cancelled: 'order.cancelled',
};

export type CreateOrderPayloadEvent = {
  id: string;
  status: string;
  userId: string;
  expiresAt: string;
  version: number;
  ticket: {
    id: string;
    price: number;
  };
};

export type CancelledOrderPayloadEvent = {
  id: string;
  version: number;
  ticket: {
    id: string;
  };
};
