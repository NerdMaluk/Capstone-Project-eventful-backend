import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaystackService } from './paystack.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Lógica Principal: Iniciar compra ou gerar bilhete gratuito
   */
  async buyTicket(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.capacity <= 0) throw new BadRequestException('Evento esgotado');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Utilizador não encontrado');

    // Verifica se já tem um bilhete ativo
    const existingTicket = await this.prisma.ticket.findFirst({
      where: {
        eventId,
        attendeeId: userId,
        status: { in: ['ACTIVE', 'USED'] },
      },
    });

    if (existingTicket) {
      throw new BadRequestException('Já tens um bilhete para este evento');
    }

    // --- LOGICA PARA EVENTO GRATUITO ---
    if (event.price === 0) {
      return this.prisma.$transaction(async (tx) => {
        const updatedEvent = await tx.event.update({
          where: { id: eventId },
          data: { capacity: { decrement: 1 } },
        });

        if (updatedEvent.capacity < 0) {
          throw new BadRequestException(
            'O evento esgotou durante o processamento',
          );
        }

        return tx.ticket.create({
          data: {
            eventId,
            attendeeId: userId,
            status: 'ACTIVE',
            qrCode: `TKT-FREE-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          },
          include: { event: true },
        });
      });
    }

    // --- LOGICA PARA EVENTO PAGO (PAYSTACK) ---
    try {
      const paymentData = await this.paystackService.initializeTransaction(
        user.email,
        event.price,
        eventId,
        userId, // Enviamos o userId para o Paystack guardar no metadata
      );

      return {
        message: 'Pagamento necessário',
        paymentUrl: paymentData.authorization_url,
        reference: paymentData.reference,
        isPaid: true,
      };
    } catch (error) {
      throw new BadRequestException('Falha ao comunicar com Paystack');
    }
  }

  /**
   * Criado pelo Webhook após confirmação real do pagamento
   */
  async createTicketAfterPayment(data: {
    userId: string;
    eventId: string;
    reference: string;
    pricePaid: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Evitar duplicidade (Idempotência)
      const existing = await tx.ticket.findUnique({
        where: { reference: data.reference },
      });

      if (existing) return existing;

      // 2. Decrementar capacidade
      const updatedEvent = await tx.event.update({
        where: { id: data.eventId },
        data: { capacity: { decrement: 1 } },
      });

      if (updatedEvent.capacity < 0) {
        // Aqui o dinheiro já caiu, então em produção você deve logar para estorno manual
        throw new Error('Evento esgotou após pagamento. Contactar suporte.');
      }

      // 3. Criar o bilhete final
      return tx.ticket.create({
        data: {
          eventId: data.eventId,
          attendeeId: data.userId,
          status: 'ACTIVE',
          reference: data.reference,
          qrCode: `TKT-PAID-${data.reference.substring(0, 8).toUpperCase()}`,
        },
        include: { event: true },
      });
    });
  }

  /**
   * Listar bilhetes do utilizador logado
   */
  async getMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { attendeeId: userId },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            location: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Detalhes de um bilhete específico
   */
  async getTicketById(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket || ticket.attendeeId !== userId) {
      throw new NotFoundException('Bilhete não encontrado');
    }

    return ticket;
  }

  /**
   * Histórico de Check-ins (Para Criadores)
   */
  async getCheckInHistory(creatorId: string) {
    return this.prisma.ticket.findMany({
      where: {
        event: { creatorId },
        scannedAt: { not: null },
      },
      include: {
        attendee: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
      orderBy: { scannedAt: 'desc' },
    });
  }
}
