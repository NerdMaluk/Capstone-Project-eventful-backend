import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(dto: CreateEventDto, creatorId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        price: dto.price,
        creator: { connect: { id: creatorId } },
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      include: {
        creator: { select: { id: true, email: true } },
        // Opcional: contar quantos tickets já foram vendidos
        _count: { select: { tickets: true } },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }
}
