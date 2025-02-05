// src/job/job.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { City, Company, ContractType, Job, Skill } from '../entity/jobs.entity';
import { JobFilterDto } from '../dto/job-filter.dto';
import { CustomLoggerService } from '../../common/services/logger.service';
import { AppError } from '../../common/errors/app.error';
import { QueryFailedError } from 'typeorm';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { UnifiedJobDto } from '../dto/unified-job.dto';

@Injectable()
export class ApiService {
  private readonly logger: CustomLoggerService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(ContractType)
    private readonly contractTypeRepository: Repository<ContractType>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {
    this.logger = new CustomLoggerService(ApiService.name);
  }

  private async retry<T>(
    operation: () => Promise<T>,
    retries = this.MAX_RETRIES,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        this.logger.warn(
          `Operation failed, retrying... (${retries} attempts left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  async getJobs(filter: JobFilterDto): Promise<PaginatedResponseDto<Job>> {
    try {
      const result = await this.retry(async () => {
        const query = this.buildJobQuery(filter);
        return await query.getManyAndCount();
      });

      const [data, total] = result;
      this.logger.debug(`Found ${total} jobs matching the criteria`);
      return { data, total ,totalPages: Math.ceil(total / (filter.limit ?? 10)),
        currentPage: filter.page ?? 1, };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private buildJobQuery(filter: JobFilterDto) {
    try {
      const query = this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.city', 'city')
        .leftJoinAndSelect('job.company', 'company')
        .leftJoinAndSelect('job.jobContractTypes', 'jobContractType')
        .leftJoinAndSelect('jobContractType.contractType', 'contractType')
        .leftJoinAndSelect('job.jobSkills', 'jobSkill')
        .leftJoinAndSelect('jobSkill.skill', 'skill')
        .take(filter.limit ?? 10)
        .skip(((filter.page ?? 1) - 1) * (filter.limit ?? 10));
  
      if (filter.title) {
        query.andWhere('job.title LIKE :title', { title: `%${filter.title}%` });
      }
  
      if (filter.location) {
        query.andWhere('city.name LIKE :location', {
          location: `%${filter.location}%`,
        });
      }
  
      if (filter.salaryMin !== undefined && filter.salaryMax !== undefined) {
        query.andWhere(
          'job.compensation_min BETWEEN :salaryMin AND :salaryMax',
          {
            salaryMin: filter.salaryMin,
            salaryMax: filter.salaryMax,
          },
        );
      } else if (filter.salaryMin !== undefined) {
        query.andWhere('job.compensation_min >= :salaryMin', {
          salaryMin: filter.salaryMin,
        });
      } else if (filter.salaryMax !== undefined) {
        query.andWhere('job.compensation_max <= :salaryMax', {
          salaryMax: filter.salaryMax,
        });
      }
  
      if (filter.company) {
        query.andWhere('company.name LIKE :company', {
          company: `%${filter.company}%`,
        });
      }
  
      if (filter.skills) {
        const skillsArray = Array.isArray(filter.skills)
          ? filter.skills
          : [filter.skills];
        if (skillsArray.length > 0) {
          query.andWhere('skill.name IN (:...skills)', { skills: skillsArray });
        }
      }
  
      if (filter.contractTypes) {
        const contractTypesArray = Array.isArray(filter.contractTypes)
          ? filter.contractTypes
          : [filter.contractTypes];
        if (contractTypesArray.length > 0) {
          query.andWhere('contractType.type IN (:...contractTypes)', {
            contractTypes: contractTypesArray,
          });
        }
      }
  
  
  
      return query;
    } catch (error) {
      throw AppError.BadRequest(
        'Invalid filter parameters',
        'INVALID_FILTER',
        error,
      );
    }
  }

  private handleDatabaseError(error: any): never {
    if (error instanceof QueryFailedError) {
      this.logger.error('Database query failed', error.stack);
      throw AppError.Database(
        'Failed to execute database query',
        'DB_QUERY_ERROR',
        {
          query: error.query,
          parameters: error.parameters,
        },
      );
    }

    if (error instanceof AppError) {
      throw error;
    }

    this.logger.error('Unexpected error occurred', error.stack);
    throw AppError.Database('An unexpected error occurred while fetching jobs');
  }

  
  private mapToUnifiedJobDto(job: any): UnifiedJobDto {
    return {
      jobId: job.jobId,
      title: job.title,
      remote: job.remote,
      experience: job.experience,
      city: job.city,
      state: job.state,
      fullAddress: job.fullAddress,
      contractType: job.contractTypes.map(ct => ct.contractType.type),
      compensation: {
        min: job.compensation_min,
        max: job.compensation_max,
        currency: job.compensation_currency,
        salaryRange: job.compensation_salary_range
      },
      company: {
        name: job.company.name,
        website: job.company.website
      },
      industry: job.industry.name,
      skills: job.skills.map(s => s.skill.name),
      postedDate: job.postedDate
    };
  }
}
