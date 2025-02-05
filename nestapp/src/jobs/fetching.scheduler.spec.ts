import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { JobScheduler } from './fetching.scheduler';
import { JobService } from './providers/jobs.service';
import { UnifiedJobDto } from './dto/unified-job.dto';
import { Logger } from '@nestjs/common';

describe('JobScheduler', () => {
  let scheduler: JobScheduler;
  let httpService: HttpService;
  let configService: ConfigService;
  let schedulerRegistry: SchedulerRegistry;
  let jobService: JobService;
  let loggerSpy: jest.SpyInstance;

  const mockJobs: UnifiedJobDto[] = [
    {
      jobId: 'P1-717',
      title: 'Backend Engineer',
      city: 'Austin',
      state: 'TX',
      fullAddress: 'Austin, TX',
      remote: false,
      compensation: {
        min: 56000,
        max: 113000,
        currency: 'USD',
        salaryRange: '$56k - $113k'
      },
      contractType: ['Contract'],
      company: { name: 'BackEnd Solutions', website: '' },
      industry: 'Solutions',
      skills: ['Python', 'Machine Learning', 'SQL'],
      postedDate: '2025-01-26T22:11:39.242Z',
      experience: 0
    }
  ];

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'app.scheduler.provider1Cron': '0 */1 * * * *',
        'API1_URL': 'http://api1.example.com',
        'API2_URL': 'http://api2.example.com'
      };
      return config[key];
    })
  };

  beforeEach(async () => {
    // Mock Logger
    loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobScheduler,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn()
          }
        },
        {
          provide: JobService,
          useValue: {
            insertJob: jest.fn().mockResolvedValue(undefined)
          }
        }
      ]
    }).compile();

    scheduler = module.get<JobScheduler>(JobScheduler);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    jobService = module.get<JobService>(JobService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  test('should configure dynamic scheduler on bootstrap', async () => {
    await scheduler.onApplicationBootstrap();
    expect(schedulerRegistry.addCronJob).toHaveBeenCalled();
  });

  test('should process jobs successfully', async () => {
    await (scheduler as any).processJobs(mockJobs);
    
    expect(jobService.insertJob).toHaveBeenCalledTimes(mockJobs.length);
    expect(jobService.insertJob).toHaveBeenCalledWith(mockJobs[0]);
  });

  test('should handle job insertion errors', async () => {
    const errorJob = { ...mockJobs[0], jobId: 'error-job' };
    const dbError = new Error('Database error');
    jest.spyOn(jobService, 'insertJob').mockRejectedValueOnce(dbError);

    await (scheduler as any).processJobs([errorJob]);
    
    expect(jobService.insertJob).toHaveBeenCalledWith(errorJob);
    expect(loggerSpy).toHaveBeenCalledWith(
      `Failed to insert job ${errorJob.title}: Database error`
    );
  });



 
}); 