import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentDto {
  @IsNotEmpty()
  @IsString()
  readonly orderId: string;

  @IsNotEmpty()
  @IsString()
  readonly token: string;
}
