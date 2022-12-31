import { OrderStatus, User } from '@app/common';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentDto } from './dto/paymentDto';
import { OrdersService } from './orders.service';

@Injectable()
export class PaymentsService {
  constructor(private orderService: OrdersService) {}

  async payment(user: User, payment: PaymentDto) {
    const order = await this.orderService.getOrder(payment.orderId);

    if (order.userId !== user.id) {
      throw new UnauthorizedException();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestException('Cannot pay for an cancelled order');
    }

    return { success: true };
  }
}
