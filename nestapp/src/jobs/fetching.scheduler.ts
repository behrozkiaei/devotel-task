// src/scheduler/job-scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CronJob } from 'cron';
import { UnifiedJobDto } from './dto/unified-job.dto';
import { JobFactory } from './strategies/job-conversion.factory';
import { JobService } from './providers/jobs.service';

@Injectable()
export class JobScheduler {
  private readonly logger = new Logger(JobScheduler.name);
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly jobService: JobService
  ) {}

  async onApplicationBootstrap() {
    await this.configureDynamicScheduler();
  }

  private async configureDynamicScheduler() {
    const frequency =  this.configService.get<string>('PROVIDER_CRON', '0 */10 * * * *');
    
    const job = new CronJob(frequency, async () => {
      this.logger.log('Starting job fetch cycle...');
      await this.fetchAndProcessJobs();
    });

    this.schedulerRegistry.addCronJob('api-fetch-job', job);
    job.start();
    
    this.logger.log(`Job scheduler initialized with frequency: ${frequency}`);
  }

  private async fetchAndProcessJobs(): Promise<void> {
    try {
      const apiUrls = [
        this.configService.get<string>('API1_URL', ''),
        this.configService.get<string>('API2_URL', '')
      ]

      if (apiUrls.length === 0) {
        this.logger.warn('No API URLs configured. Using mock data for testing.');
        // await this.processMockJobs();
        return;
      }

      const allJobs: UnifiedJobDto[] = [];
      
      for (const url of apiUrls) {
        try {
          this.logger.debug(`Fetching jobs from ${url}`);
          const response = await firstValueFrom(this.httpService.get(url));
          const jobs = JobFactory.createFromAnyResponse(response.data, url);
          allJobs.push(...jobs);
          this.logger.log(`Successfully fetched ${jobs.length} jobs from ${url}`);
        } catch (error) {
          this.logger.error(`Failed to fetch from ${url}: ${error.message}`);
      }
    }
    //   const allJobs: UnifiedJobDto[] = [
    //     {
    //       jobId: 'P1-717',
    //       title: 'Backend Engineer',
    //       city: 'Austin',
    //       state: 'TX',
    //       fullAddress: 'Austin, TX',
    //       remote: false,
    //       compensation: {
    //         min: 56000,
    //         max: 113000,
    //         currency: 'USD',
    //         salaryRange: '$56k - $113k'
    //       },
    //       contractType: [ 'Contract' ],
    //       company: { name: 'BackEnd Solutions', website: '' },
    //       industry: 'Solutions',
    //       skills: [ 'Python', 'Machine Learning', 'SQL' ],
    //       postedDate: '2025-01-26T22:11:39.242Z',
    //       experience: 0
    //     },
    //      {
    //       jobId: 'P1-748',
    //       title: 'Software Engineer',
    //       city: 'San Francisco',
    //       state: 'CA',
    //       fullAddress: 'San Francisco, CA',
    //       remote: false,
    //       compensation: {
    //         min: 86000,
    //         max: 103000,
    //         currency: 'USD',
    //         salaryRange: '$86k - $103k'
    //       },
    //       contractType: [ 'Full-Time' ],
    //       company: { name: 'TechCorp', website: '' },
    //       industry: 'Design',
    //       skills: [ 'Python', 'Machine Learning', 'SQL' ],
    //       postedDate: '2025-01-30T03:20:03.067Z',
    //       experience: 0
    //     },
    //      {
    //       jobId: 'job-775',
    //       title: 'Data Scientist',
    //       city: 'Seattle',
    //       state: 'TX',
    //       fullAddress: 'Seattle, TX',
    //       remote: true,
    //       contractType: [ 'Remote' ],
    //       compensation: {
    //         min: 66000,
    //         max: 106000,
    //         currency: 'USD',
    //         salaryRange: '$66k - $106k'
    //       },
    //       company: {
    //         name: 'BackEnd Solutions',
    //         website: 'https://creativedesign ltd.com'
    //       },
    //       industry: '',
    //       skills: [ 'Python', 'Machine Learning', 'SQL' ],
    //       postedDate: '2025-01-27',
    //       experience: 2
    //     },
    //      {
    //       jobId: 'job-812',
    //       title: 'Frontend Developer',
    //       city: 'New York',
    //       state: 'NY',
    //       fullAddress: 'New York, NY',
    //       remote: false,
    //       contractType: [],
    //       compensation: {
    //         min: 69000,
    //         max: 118000,
    //         currency: 'USD',
    //         salaryRange: '$69k - $118k'
    //       },
    //       company: { name: 'DataWorks', website: 'https://techcorp.com' },
    //       industry: '',
    //       skills: [ 'HTML', 'CSS', 'Vue.js' ],
    //       postedDate: '2025-01-28',
    //       experience: 1
    //     }
      
    // ];
      // console.log(allJobs);
      await this.processJobs(allJobs);
    } catch (error) {
      this.logger.error(`Job fetch cycle failed: ${error.message}`);
    }
  }



  private async processJobs(jobs: UnifiedJobDto[]): Promise<void> {
    this.logger.log(`Processing ${jobs.length} jobs`);
    
    let successCount = 0;
    let errorCount = 0;

    for await(const job of jobs) {
      try {
        await this.jobService.insertJob(job);
        successCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(`Failed to insert job ${job.title}: ${error.message}`);
      }
    }

    this.logger.log(`Job processing complete. Success: ${successCount}, Errors: ${errorCount}`);
  }
}