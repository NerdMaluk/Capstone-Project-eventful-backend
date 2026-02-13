import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // 1. Esse alimenta os "Cards" de cima (Total Events, Revenue, etc)
  async getCreatorAnalytics(creatorId: string) {
    const totalEvents = await this.prisma.event.count({
      where: { creatorId },
    });

    const tickets = await this.prisma.ticket.findMany({
      where: {
        event: { creatorId },
        status: { in: ['ACTIVE', 'USED'] },
      },
      select: {
        event: { select: { price: true } },
      },
    });

    const totalTicketsSold = tickets.length;
    const totalRevenue = tickets.reduce(
      (sum, t) => sum + (t.event.price || 0),
      0,
    );

    const totalCheckIns = await this.prisma.ticket.count({
      where: {
        event: { creatorId },
        scannedAt: { not: null },
      },
    });

    return {
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      totalCheckIns,
    };
  }

  // 2. Esse alimenta a "Tabela" de baixo (Detalhes por evento)
  async getEventsWithStats(creatorId: string) {
    const events = await this.prisma.event.findMany({
      where: { creatorId },
      include: {
        _count: {
          select: { tickets: true }, // Conta quantos tickets existem para este evento
        },
      },
    });

    return events.map((event) => {
      const sold = event._count.tickets;
      // Capacidade total original = capacidade atual + tickets já vendidos
      const totalCapacity = event.capacity + sold;

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        price: event.price,
        sold: sold,
        revenue: sold * event.price,
        // Porcentagem de preenchimento
        progress:
          totalCapacity > 0 ? Math.round((sold / totalCapacity) * 100) : 0,
      };
    });
  }
}
