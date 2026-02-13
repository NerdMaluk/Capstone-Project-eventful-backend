import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express'; // Certifique-se de importar o Request do express

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get analytics and table data for event creators' })
  @Get('creator')
  @UseGuards(JwtAuthGuard)
  async getCreatorAnalytics(
    @Req() req: Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;

    // Buscamos as duas informações em paralelo para ser mais rápido
    const [stats, tableData] = await Promise.all([
      this.analyticsService.getCreatorAnalytics(userId),
      this.analyticsService.getEventsWithStats(userId),
    ]);

    // Retornamos um objeto único com tudo que o Dashboard precisa
    return {
      stats, // Dados para os 4 cards de cima
      tableData, // Array para a tabela de eventos
    };
  }
}
