import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobService } from '../providers/jobs.service';
import { ApiService } from '../providers/api.service';
import { JobController } from '../controllers/job/jobs.controller';
import { ApiController } from '../controllers/api/api.controller';
import { CustomLoggerService } from '../../common/services/logger.service';
import { EntitySchema } from 'typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { testDbConfig } from './unit-tests/test-database.config';
import { StateService } from '../providers/state.service';
import { CityService } from '../providers/city.service';
import { CompanyService } from '../providers/company.service';
import { ContractTypeService } from '../providers/contractType.service';
import { IndustryService } from '../providers/industry.service';
import { JobContractTypeService } from '../providers/job-contract-type.service';
import { JobSkillService } from '../providers/job-skill.service';
import { SkillService } from '../providers/skill.service';

export async function createTestingModule() {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(testDbConfig),
      TypeOrmModule.forFeature(
        (testDbConfig.entities as EntityClassOrSchema[]) || [],
      ),
    ],
    controllers: [JobController, ApiController],
    providers: [
      JobService,
      ApiService,
      CustomLoggerService,
      StateService,
      CityService,
      CompanyService,
      ContractTypeService,
      IndustryService,
      JobContractTypeService,
      JobSkillService,
      SkillService
    ],
  }).compile();

  return module;
}

export const mockJob = {
  jobId: 'test-job-1',
  title: 'Software Engineer',
  remote: true,
  experience: 3,
  city: 'San Francisco',
  state: 'California',
  fullAddress: '123 Tech St, San Francisco, CA',
  contractType: ['Full-time'],
  compensation: {
    min: 100000,
    max: 150000,
    currency: 'USD',
    salaryRange: '100k-150k',
  },
  company: {
    name: 'Tech Corp',
    website: 'https://techcorp.com',
  },
  industry: 'Technology',
  skills: ['JavaScript', 'TypeScript', 'Node.js'],
  postedDate: '2024-03-20',
};
