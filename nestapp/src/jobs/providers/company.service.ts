import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entity/jobs.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) {}

  async findOrCreate(company: { name: string; website: string; }): Promise<Company> {
    let dbCompany = await this.companyRepository.findOne({ where: { name: company.name } });
    if (!dbCompany) {
      dbCompany = this.companyRepository.create({
        name: company.name,
        website: company.website,
      });
      await this.companyRepository.save(dbCompany);
    }
    return dbCompany;
  }
}

