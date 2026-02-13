import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export class TicketDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'PENDING' })
  @IsEnum(['PENDING', 'PAID'])
  status: 'PENDING | ACTIVE |  | USED | CANCELLED';
}
