import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Job, State, City, Company, ContractType, Industry, Skill, JobContractType,JobSkill  } from '../../entity/jobs.entity';


export const testDbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [Job, State, City, Company, ContractType, Industry, Skill, JobContractType, JobSkill] as const,
  synchronize: true,
  logging: false,
}; 