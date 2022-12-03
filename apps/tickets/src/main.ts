import { NestFactory } from '@nestjs/core';
import { TicketsModule } from './tickets.module';

async function bootstrap() {
  const app = await NestFactory.create(TicketsModule);
  await app.listen(3000);
}
bootstrap();
