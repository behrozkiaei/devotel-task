import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobSkill } from '../entity/jobs.entity';
import { CustomLoggerService } from '../../common/services/logger.service';
import { SkillService } from './skill.service';

@Injectable()
export class JobSkillService {
  private readonly logger: CustomLoggerService;

  constructor(
    @InjectRepository(JobSkill)
    private readonly jobSkillRepository: Repository<JobSkill>,
    private readonly skillService: SkillService,
  ) {
    this.logger = new CustomLoggerService(JobSkillService.name);
  }

  async addSkillsToJob(job: any, skills: string[]) {
    this.logger.debug(`Adding ${skills.length} skills to job ${job.jobId}`);
    
    for (const skill of skills) {
      const dbSkill = await this.skillService.findOrCreate(skill);
      await this.jobSkillRepository.save({ job: job, skillId: dbSkill.id });
    }
    
    this.logger.debug(`Successfully added ${skills.length} skills to job ${job.jobId}`);
  }
} 