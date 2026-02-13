import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PaystackService } from './paystack.service';

@Module({
  providers: [TicketsService, PaystackService],
  exports: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
