import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './createTicketDto';

export class EditTicketDto extends PartialType(CreateTicketDto) {}
