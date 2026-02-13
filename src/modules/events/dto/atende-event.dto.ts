import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AtendeEventDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  userId: string;
}
