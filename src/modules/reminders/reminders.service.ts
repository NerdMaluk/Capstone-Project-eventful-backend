// src/modules/reminders/reminders.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEventReminders() {
    this.logger.log('--- Generating In-App Reminders ---');

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const upcomingEvents = await this.prisma.event.findMany({
      where: { date: { gte: now, lte: tomorrow } },
      include: { tickets: { include: { attendee: true } } },
    });

    for (const event of upcomingEvents) {
      for (const ticket of event.tickets) {
        await this.prisma.notification.create({
          data: {
            userId: ticket.attendeeId,
            title: 'Event Reminder! 🎫',
            message: `Hi ${ticket.attendee.name}, your event "${event.title}" starts tomorrow at ${event.location}!`,
          },
        });
        this.logger.log(
          `Notification stored for user: ${ticket.attendee.name}`,
        );
      }
    }
  }
}
