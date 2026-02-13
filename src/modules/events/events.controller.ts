import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiOperation } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { id: string; userId: string; role: string };
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @ApiOperation({ summary: 'Get all available events' })
  @Get()
  @Roles('CREATOR', 'EVENTEE')
  findAll() {
    return this.eventsService.findAll();
  }

  @ApiOperation({ summary: 'Create a new event (CREATOR only)' })
  @Roles('CREATOR')
  @Post()
  create(@Body() dto: CreateEventDto, @Req() req: RequestWithUser) {
    return this.eventsService.createEvent(
      { ...dto, price: dto.price, date: new Date(dto.date) },
      req.user.userId,
    );
  }
}
