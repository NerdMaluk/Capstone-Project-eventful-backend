import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Use o seu guard de autenticação

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  // Listar todas as notificações do usuário logado
  @Get()
  async findAll(@Request() req: Request & { user: { userId: string } }) {
    return await this.prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Marcar uma notificação como lida
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
  @Patch('read-all')
  async markAllAsRead(@Request() req: Request & { user: { id: string } }) {
    return this.prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
  }
}
