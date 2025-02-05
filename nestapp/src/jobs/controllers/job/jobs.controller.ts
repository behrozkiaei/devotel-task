// job.controller.ts
import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { UnifiedJobDto } from '../../../jobs/dto/unified-job.dto';
import { JobService } from '../../providers/jobs.service';


@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async createJob(@Body() jobDto: UnifiedJobDto) {
    try {
      return await this.jobService.insertJob(jobDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}