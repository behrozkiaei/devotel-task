// src/job/dto/job-filter.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class JobFilterDto {
  @ApiProperty({
    required: false,
    description: 'Filter by job title (case-insensitive partial match)'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by location (city or state)'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    required: false,
    description: 'Minimum salary filter'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({
    required: false,
    description: 'Maximum salary filter'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by company name (case-insensitive partial match)'
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    type: [String],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  skills?: string[] = [];

  @ApiProperty({
    type: [String],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  contractTypes?: string[] = [];

  @ApiProperty({
    required: false,
    default: 1,
    description: 'Page number for pagination'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Number of items per page'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}