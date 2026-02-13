import {
  Controller,
  Post,
  Body,
  Headers,
  Res,
  HttpStatus,
} from '@nestjs/common';
import * as e from 'express';
import * as crypto from 'crypto';
import { TicketsService } from '../tickets/tickets.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Res() res: e.Response,
  ) {
    console.log('--- NOTIFICAÇÃO RECEBIDA ---');

    // 1. Verifique se o Secret existe
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    if (!secret) {
      console.error('❌ ERRO: PAYSTACK_SECRET_KEY não encontrada no .env');
      return res.status(500).send('Server configuration error');
    }

    // 2. Gere o Hash
    // Importante: use JSON.stringify(body) apenas se não tiver o raw-body
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    // 3. Compare as assinaturas
    if (hash !== signature) {
      console.error('❌ Assinatura Inválida!');
      return res.status(HttpStatus.UNAUTHORIZED).send('Invalid Signature');
    }

    console.log('✅ Assinatura Válida! Processando evento:', body.event);

    if (body.event === 'charge.success') {
      const { metadata, reference, amount } = body.data;

      console.log(`🎫 Criando ticket para o usuário: ${metadata?.userId}`);

      await this.ticketsService.createTicketAfterPayment({
        userId: metadata.userId,
        eventId: metadata.eventId,
        reference: reference,
        pricePaid: amount / 100,
      });
    }

    return res.status(HttpStatus.OK).send('OK');
  }
}
