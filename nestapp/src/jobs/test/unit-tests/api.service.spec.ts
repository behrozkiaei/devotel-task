import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { Logger } from '@nestjs/common';
import {
  City,
  Company,
  ContractType,
  Job,
  Skill,
} from '../../entity/jobs.entity';
import { JobFilterDto } from 'src/jobs/dto/job-filter.dto';
import { AppError } from '../../../common/errors/app.error';
import { ApiService } from '../../providers/api.service';

describe('ApiService', () => {
  let service: ApiService;
  let jobRepository: Repository<Job>;
  let cityRepository: Repository<City>;
  let companyRepository: Repository<Company>;
  let contractTypeRepository: Repository<ContractType>;
  let skillRepository: Repository<Skill>;
  let loggerSpy: jest.SpyInstance;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        {
          provide: getRepositoryToken(Job),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(City),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ContractType),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    contractTypeRepository = module.get<Repository<ContractType>>(
      getRepositoryToken(ContractType),
    );
    skillRepository = module.get<Repository<Skill>>(getRepositoryToken(Skill));

    mockQueryBuilder.getManyAndCount.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJobs', () => {
    const mockFilter: JobFilterDto = {
      page: 1,
      limit: 10,
      title: 'Software Engineer',
      location: 'New York',
      salaryMin: 50000,
      salaryMax: 150000,
      company: 'Tech Corp',
      skills: ['JavaScript', 'TypeScript'],
      contractTypes: ['Full-time'],
    };

    const mockJobs = [
      {
        id: 1,
        title: 'Software Engineer',
        city: { name: 'New York' },
        company: { name: 'Tech Corp' },
      },
    ];

    it('should return jobs with total count', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockJobs, 1]);

      const result = await service.getJobs(mockFilter);

      expect(result).toEqual({
        data: mockJobs,
        total: 1,
        totalPages: 1,
        currentPage: 1,
      });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'job.city',
        'city',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'job.company',
        'company',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'job.jobContractTypes',
        'jobContractType',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'jobContractType.contractType',
        'contractType',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'job.jobSkills',
        'jobSkill',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'jobSkill.skill',
        'skill',
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(mockFilter.limit);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should handle filter parameters correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      await service.getJobs(mockFilter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job.title LIKE :title',
        { title: '%Software Engineer%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'city.name LIKE :location',
        { location: '%New York%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job.compensation_min BETWEEN :salaryMin AND :salaryMax',
        { salaryMin: 50000, salaryMax: 150000 },
      );
    });

    it('should handle database errors', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.getJobs(mockFilter)).rejects.toThrow(AppError);
    });

    it('should handle retry logic on failure', async () => {
      mockQueryBuilder.getManyAndCount
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce([mockJobs, 1]);

      const result = await service.getJobs(mockFilter);

      expect(result).toEqual({ data: mockJobs, total: 1 ,totalPages :1  , currentPage:1 });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(2);
    });

    it('should handle partial salary filter', async () => {
      const partialFilter: Partial<JobFilterDto> = {
        salaryMin: 50000,
        skills: [],
        contractTypes: [],
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockJobs, 1]);

      await service.getJobs(partialFilter as JobFilterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'job.compensation_min >= :salaryMin',
        { salaryMin: 50000 },
      );
    });

    it('should handle skills filter array', async () => {
      const skillsFilter: JobFilterDto = {
        skills: ['JavaScript', 'TypeScript'],
        contractTypes: [],
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockJobs, 1]);

      await service.getJobs(skillsFilter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'skill.name IN (:...skills)',
        { skills: ['JavaScript', 'TypeScript'] },
      );
    });
  });

  describe('error handling', () => {
    const baseFilter: JobFilterDto = {
      skills: [],
      contractTypes: [],
    };

    it('should handle QueryFailedError', async () => {
      const queryError = new QueryFailedError(
        'SELECT * FROM jobs',
        [],
        new Error('DB Error'),
      );
      mockQueryBuilder.getManyAndCount.mockRejectedValue(queryError);

      await expect(service.getJobs(baseFilter)).rejects.toThrow(AppError);
      expect(loggerSpy).toHaveBeenCalledWith(
        '[ERROR] Database query failed',
        expect.any(String),
      );
    });

    it('should handle general errors', async () => {
      const error = new Error('Unexpected error');
      mockQueryBuilder.getManyAndCount.mockRejectedValue(error);

      await expect(service.getJobs(baseFilter)).rejects.toThrow(
        'An unexpected error occurred while fetching jobs',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        '[ERROR] Unexpected error occurred',
        expect.any(String),
      );
    });

    it('should propagate AppError', async () => {
      const appError = AppError.BadRequest('Invalid filter', 'INVALID_FILTER');
      mockQueryBuilder.getManyAndCount.mockRejectedValue(appError);

      await expect(service.getJobs(baseFilter)).rejects.toThrow(appError);
    });
  });
});
