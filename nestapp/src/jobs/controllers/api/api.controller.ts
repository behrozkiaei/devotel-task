// src/job/job.controller.ts
import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobFilterDto } from '../../dto/job-filter.dto';
import { PaginatedResponseDto } from '../../dto/paginated-response.dto';
import { UnifiedJobDto } from 'src/jobs/dto/unified-job.dto';
import { Job } from 'src/jobs/entity/jobs.entity';
import { ApiService } from '../../providers/api.service';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';
import { CustomLoggerService } from '../../../common/services/logger.service';
import { promises } from 'dns';

@ApiTags('Job Offers')
@Controller('api/job-offers')
@UseFilters(HttpExceptionFilter)
export class ApiController {
  private readonly logger: CustomLoggerService;

  constructor(private readonly apiService: ApiService) {
    this.logger = new CustomLoggerService(ApiController.name);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get paginated job offers with filters',
    description: 'Retrieve job offers with optional filters and pagination'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved job offers',
    type: PaginatedResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getJobOffers(@Query() filters: JobFilterDto) :Promise<PaginatedResponseDto<Job>>{
    this.logger.debug(`Receiving request for job offers with filters: ${JSON.stringify(filters)}`);
    return await this.apiService.getJobs(filters);
  }
}