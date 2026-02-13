import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'NestJS Workshop' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Backend event testing' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 'Lisbon' })
  @IsString()
  location: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  price: number;
}
