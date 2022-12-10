import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;
}
