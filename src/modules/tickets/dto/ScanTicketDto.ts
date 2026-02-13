import { ApiProperty } from '@nestjs/swagger';

export class ScanTicketDto {
  @ApiProperty({ example: '{ "ticketId": "uuid", "eventId": "uuid" }' })
  qrData: string;
}
