// src/modules/payments/paystack.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  async initializeTransaction(
    email: string,
    amount: number,
    eventId: string,
    userId: string,
  ) {
    const url = 'https://api.paystack.co/transaction/initialize';

    try {
      const response = await axios.post(
        url,
        {
          email,
          amount: Math.round(amount * 100), // Paystack recebe em centavos
          currency: 'NGN', // Alterado para NGN para evitar o erro 403 (USD)
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
          // O metadata é o que o Webhook vai ler depois
          metadata: {
            eventId,
            userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data; // Retorna { authorization_url, reference, etc }
    } catch (error: any) {
      console.error(
        'Paystack Init Error:',
        error.response?.data || error.message,
      );
      throw new Error('Could not initialize payment');
    }
  }
}
