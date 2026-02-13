import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { TicketsModule } from '../tickets/tickets.module'; // Importamos o módulo que tem o serviço

@Module({
  imports: [TicketsModule], // Isso dá acesso ao TicketsService para o Controller
  controllers: [PaymentsController],
})
export class PaymentsModule {}
