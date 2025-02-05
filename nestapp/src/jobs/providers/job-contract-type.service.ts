import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobContractType } from '../entity/jobs.entity';
import { CustomLoggerService } from '../../common/services/logger.service';
import { ContractTypeService } from './contractType.service';

@Injectable()
export class JobContractTypeService {
  private readonly logger: CustomLoggerService;

  constructor(
    @InjectRepository(JobContractType)
    private readonly jobContractTypeRepository: Repository<JobContractType>,
    private readonly contractTypeService: ContractTypeService,
  ) {
    this.logger = new CustomLoggerService(JobContractTypeService.name);
  }

  async addContractTypesToJob(job: any, contractTypes: string[]) {
    this.logger.debug(`Adding ${contractTypes.length} contract types to job ${job.jobId}`);
    
    for (const type of contractTypes) {
      const dbContractType = await this.contractTypeService.findOrCreate(type);
      await this.jobContractTypeRepository.save({ job: job, contractType: dbContractType });
    }
    
    this.logger.debug(`Successfully added ${contractTypes.length} contract types to job ${job.jobId}`);
  }
} 