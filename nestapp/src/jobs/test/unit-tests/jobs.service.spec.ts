import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobService } from '../../providers/jobs.service';
import { Job, JobContractType, JobSkill, State, City, Company, Industry } from '../../entity/jobs.entity';
import { StateService } from '../../providers/state.service';
import { CityService } from '../../providers/city.service';
import { CompanyService } from '../../providers/company.service';
import { IndustryService } from '../../providers/industry.service';
import { SkillService } from '../../providers/skill.service';
import { ContractTypeService } from '../../providers/contractType.service';
import { JobSkillService } from '../../providers/job-skill.service';
import { JobContractTypeService } from '../../providers/job-contract-type.service';
import { CustomLoggerService } from '../../../common/services/logger.service';
import { UnifiedJobDto } from '../../dto/unified-job.dto';

describe('JobService', () => {
  let service: JobService;
  let jobRepository: Repository<Job>;
  let jobContractTypeRepository: Repository<JobContractType>;
  let jobSkillRepository: Repository<JobSkill>;
  let stateService: StateService;
  let cityService: CityService;
  let companyService: CompanyService;
  let industryService: IndustryService;
  let jobSkillService: JobSkillService;
  let jobContractTypeService: JobContractTypeService;
  let logger: CustomLoggerService;

  const mockJob: UnifiedJobDto = {
    jobId: 'test-123',
    title: 'Software Engineer',
    remote: false,
    experience: 2,
    city: 'New York',
    state: 'NY',
    fullAddress: 'New York, NY',
    contractType: ['Full-time'],
    compensation: {
      min: 80000,
      max: 120000,
      currency: 'USD',
      salaryRange: '$80k - $120k'
    },
    company: {
      name: 'Tech Corp',
      website: 'https://techcorp.com'
    },
    industry: 'Technology',
    skills: ['JavaScript', 'TypeScript'],
    postedDate: '2024-02-03T00:00:00.000Z'
  };

  const mockState = {
    id: 1,
    name: 'NY',
    cities: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as State;

  const mockCity = {
    id: 1,
    name: 'New York',
    state: mockState,
    jobs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as City;

  const mockCompany = {
    id: 1,
    name: 'Tech Corp',
    website: 'https://techcorp.com',
    jobs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as Company;

  const mockIndustry = {
    id: 1,
    name: 'Technology',
    jobs: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as Industry;

  const mockDbJob = {
    id: 1,
    jobId: mockJob.jobId,
    title: mockJob.title,
    remote: mockJob.remote,
    experience: mockJob.experience,
    city: mockCity,
    full_address: mockJob.fullAddress,
    compensation_min: mockJob.compensation.min,
    compensation_max: mockJob.compensation.max,
    compensation_currency: mockJob.compensation.currency,
    compensation_salary_range: mockJob.compensation.salaryRange,
    company: mockCompany,
    industry: mockIndustry,
    posted_date: new Date(mockJob.postedDate),
    createdAt: new Date(),
    updatedAt: new Date(),
    jobContractTypes: [],
    jobSkills: []
  } as Job;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(Job),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobContractType),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobSkill),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: StateService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: CityService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: CompanyService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: IndustryService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: SkillService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: ContractTypeService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: JobSkillService,
          useValue: {
            addSkillsToJob: jest.fn(),
          },
        },
        {
          provide: JobContractTypeService,
          useValue: {
            addContractTypesToJob: jest.fn(),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    jobContractTypeRepository = module.get<Repository<JobContractType>>(getRepositoryToken(JobContractType));
    jobSkillRepository = module.get<Repository<JobSkill>>(getRepositoryToken(JobSkill));
    stateService = module.get<StateService>(StateService);
    cityService = module.get<CityService>(CityService);
    companyService = module.get<CompanyService>(CompanyService);
    industryService = module.get<IndustryService>(IndustryService);
    jobSkillService = module.get<JobSkillService>(JobSkillService);
    jobContractTypeService = module.get<JobContractTypeService>(JobContractTypeService);
    logger = module.get<CustomLoggerService>(CustomLoggerService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('should successfully insert a new job', async () => {
    jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(stateService, 'findOrCreate').mockResolvedValue(mockState);
    jest.spyOn(cityService, 'findOrCreate').mockResolvedValue(mockCity);
    jest.spyOn(companyService, 'findOrCreate').mockResolvedValue(mockCompany);
    jest.spyOn(industryService, 'findOrCreate').mockResolvedValue(mockIndustry);
    jest.spyOn(jobRepository, 'create').mockReturnValue(mockDbJob);
    jest.spyOn(jobRepository, 'save').mockResolvedValue(mockDbJob);

    await service.insertJob(mockJob);

    expect(jobRepository.findOne).toHaveBeenCalledWith({ where: { jobId: mockJob.jobId } });
    expect(stateService.findOrCreate).toHaveBeenCalledWith(mockJob.state);
    expect(cityService.findOrCreate).toHaveBeenCalledWith(mockJob.city, mockState);
    expect(companyService.findOrCreate).toHaveBeenCalledWith(mockJob.company);
    expect(industryService.findOrCreate).toHaveBeenCalledWith(mockJob.industry);
    expect(jobContractTypeService.addContractTypesToJob).toHaveBeenCalledWith(mockDbJob, mockJob.contractType);
    expect(jobSkillService.addSkillsToJob).toHaveBeenCalledWith(mockDbJob, mockJob.skills);
  });

  test('should skip insertion if job already exists', async () => {
    jest.spyOn(jobRepository, 'findOne').mockResolvedValue(mockDbJob);

    await service.insertJob(mockJob);

    expect(jobRepository.findOne).toHaveBeenCalledWith({ where: { jobId: mockJob.jobId } });
    expect(stateService.findOrCreate).not.toHaveBeenCalled();
    expect(jobRepository.save).not.toHaveBeenCalled();
  });

  test('should handle errors during job insertion', async () => {
    const error = new Error('Database error');
    jest.spyOn(jobRepository, 'findOne').mockRejectedValue(error);

    await expect(service.insertJob(mockJob)).rejects.toThrow('Failed to insert job: Database error');
    expect(logger.error).toHaveBeenCalled();
  });

  test('should handle errors during related entities creation', async () => {
    jest.spyOn(jobRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(stateService, 'findOrCreate').mockRejectedValue(new Error('State creation failed'));

    await expect(service.insertJob(mockJob)).rejects.toThrow('Failed to save job related entities: State creation failed');
    expect(logger.error).toHaveBeenCalled();
  });
}); 