export const OrderEvent = {
  Created: 'order.created',
};

export type CreateOrderPayloadEvent = {
  id: string;
  status: string;
  userId: string;
  expiresAt: string;
  ticket: {
    id: string;
    price: number;
  };
};
