import { Transform, Type } from 'class-transformer';

export class UnifiedJobDto {
  jobId: string;
  title: string;
  remote: boolean;
  experience: number;
  city: string;
  state: string;
  fullAddress: string;
  
  @Transform(({ value }) => value || [])
  contractType: string[];
  
  compensation: {
    min: number;
    max: number;
    currency: string;
    salaryRange: string;
  };
  
  company: {
    name: string;
    website: string;
  };
  
  industry: string;
  skills: string[];
  postedDate: string;
}

// state.dto.ts
export class State{
  name: string;
  id?: number;
}

// city.dto.ts
export class City{
  name: string;
  state_id: number;
  id?: number;
}

// company.dto.ts
export class Company{
  name: string;
  website?: string;
  id?: number;
}

// contract-type.dto.ts
export class ContractType{
  type: string;
  id?: number;
}

// industry.dto.ts
export class Industry{
  name: string;
  id?: number;
}

// skill.dto.ts
export class Skill{
  name: string;
  id?: number;
}

// job.dto.ts
export class Job{
  id?: number;
  jobId: string;
  title: string;
  remote: boolean;
  experience: number;
  cityId: number;
  fullAddress: string;
  compensationMin: number;
  compensationMax: number;
  compensationCurrency: string;
  compensationSalaryRange: string;
  companyId: number;
  industryId: number;
  postedDate: Date;
}

// job-contract-type.dto.ts
export class JobContractType{
  jobId: string;
  contractTypeId: number;
  id?: number;
}

// job-skill.dto.ts
export class JobSkill{
  jobId: string;
  skillId: number;
  id?: number;
}
