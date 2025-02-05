// industry.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../entity/jobs.entity';

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>
  ) {}

  async findOrCreate(industry: string): Promise<Industry> {
    let dbIndustry = await this.industryRepository.findOne({ where: { name: industry } });
    if (!dbIndustry) {
      dbIndustry = this.industryRepository.create({ name: industry });
      await this.industryRepository.save(dbIndustry);
    }
    return dbIndustry;
  }
}