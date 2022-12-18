import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

export class TicketDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsString()
  readonly id: string;
}
