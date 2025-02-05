import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLoggerService } from '../../common/services/logger.service';

import { StateService } from './state.service';
import { CityService } from './city.service';
import { CompanyService } from './company.service';
import { IndustryService } from './industry.service';
import { SkillService } from './skill.service';
import { ContractTypeService } from './contractType.service';
import { Job, JobContractType, JobSkill } from '../entity/jobs.entity';
import { UnifiedJobDto } from '../dto/unified-job.dto';
import { JobSkillService } from './job-skill.service';
import { JobContractTypeService } from './job-contract-type.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobContractType)
    private readonly jobContractTypeRepository: Repository<JobContractType>,
    @InjectRepository(JobSkill)
    private readonly jobSkillRepository: Repository<JobSkill>,
    private readonly stateService: StateService,
    private readonly cityService: CityService,
    private readonly companyService: CompanyService,
    private readonly industryService: IndustryService,
    private readonly skillService: SkillService,
    private readonly contractTypeService: ContractTypeService,
    private readonly jobSkillService: JobSkillService,
    private readonly jobContractTypeService: JobContractTypeService,
    private readonly logger: CustomLoggerService,
  ) {}

  async insertJob(dto: UnifiedJobDto) {
    try {
      const { jobId, title, remote, experience, city, state, fullAddress, contractType, compensation, company, industry, skills, postedDate } = dto;

      this.logger.debug(`Attempting to insert job with ID: ${jobId}`);

      const existingJob = await this.jobRepository.findOne({ where: { jobId } });
      if (existingJob) {
        this.logger.debug(`Job with ID ${jobId} already exists, skipping insertion`);
        return;
      }

      try {
        const dbState = await this.stateService.findOrCreate(state);
        const dbCity = await this.cityService.findOrCreate(city, dbState);
        const dbCompany = await this.companyService.findOrCreate(company);
        const dbIndustry = await this.industryService.findOrCreate(industry);

        const job = this.jobRepository.create({
          jobId,
          title,
          remote,
          experience,
          city: dbCity,
          full_address: dbCity.name,
          compensation_min: compensation.min,
          compensation_max: compensation.max,
          compensation_currency: compensation.currency,
          compensation_salary_range: compensation.salaryRange,
          company: dbCompany,
          industry: dbIndustry,
          posted_date: new Date(postedDate),
        });

        await this.jobRepository.save(job);
        this.logger.debug(`Successfully saved job with ID: ${jobId}`);

        // Add contract types and skills using the new services
        await this.jobContractTypeService.addContractTypesToJob(job, contractType);
        await this.jobSkillService.addSkillsToJob(job, skills);

      } catch (error) {
        this.logger.error(`Error while saving related entities for job ${jobId}: ${error.message}`, error.stack);
        throw new Error(`Failed to save job related entities: ${error.message}`);
      }

    } catch (error) {
      this.logger.error(`Failed to insert job: ${error.message}`, error.stack);
      throw new Error(`Failed to insert job: ${error.message}`);
    }
  }
}
