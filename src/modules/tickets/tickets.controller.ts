import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ScanTicketDto } from './dto/ScanTicketDto';
import { TicketsService } from './tickets.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('Tickets')
@ApiBearerAuth('access-token')
@Controller('tickets')
@UseGuards(JwtAuthGuard) // Coloquei aqui em cima para proteger todas as rotas de uma vez
export class TicketsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
  ) {}

  @ApiOperation({ summary: 'Get my tickets' })
  @Get('me')
  async getMyTickets(@Req() req: Request & { user: { userId: string } }) {
    // req.user já é garantido pelo Guard no topo da classe
    return this.ticketsService.getMyTickets(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details by ID' })
  async getTicketById(
    @Param('id') ticketId: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const ticket = await this.ticketsService.getTicketById(
      ticketId,
      req.user.userId,
    );
    if (!ticket) {
      throw new BadRequestException('Ticket not found');
    }
    return ticket;
  }

  @ApiOperation({ summary: 'Buy or Get Free ticket' })
  @Roles('EVENTEE') // Mudei de ATTENDEE para EVENTEE para bater com seu front
  @Post('buy')
  async buyTicket(
    @Body('eventId') eventId: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    if (!eventId) {
      throw new BadRequestException('Event ID is required');
    }
    // O Service cuidará se o preço é 0 ou > 0
    return await this.ticketsService.buyTicket(eventId, req.user.userId);
  }

  @ApiOperation({ summary: 'Scan and validate ticket QR code' })
  @Post('scan')
  @Roles('CREATOR')
  async scanTicket(@Body() dto: ScanTicketDto) {
    // Movi a lógica pesada para o Service no seu projeto real,
    // mas mantendo aqui conforme seu padrão:
    try {
      const payload = JSON.parse(dto.qrData) as { ticketId: string };

      const ticket = await this.prisma.ticket.findUnique({
        where: { id: payload.ticketId },
      });

      if (!ticket) throw new BadRequestException('Invalid ticket');
      if (ticket.scannedAt)
        throw new BadRequestException('Ticket already used');

      return this.prisma.ticket.update({
        where: { id: ticket.id },
        data: { scannedAt: new Date() },
      });
    } catch (e) {
      throw new BadRequestException('Invalid QR Code format');
    }
  }
  @ApiOperation({ summary: 'Get check-in history for creator' })
  @Get('history')
  @Roles('CREATOR')
  async getHistory(@Req() req: Request & { user: { userId: string } }) {
    return this.ticketsService.getCheckInHistory(req.user.userId);
  }
}
