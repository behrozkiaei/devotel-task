// contract-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractType } from '../entity/jobs.entity';

@Injectable()
export class ContractTypeService {
  constructor(
    @InjectRepository(ContractType)
    private readonly contractTypeRepository: Repository<ContractType>
  ) {}

  async findOrCreate(type: string): Promise<ContractType> {
    let dbContractType = await this.contractTypeRepository.findOne({ where: { type } });
    if (!dbContractType) {
      dbContractType = this.contractTypeRepository.create({ type });
      await this.contractTypeRepository.save(dbContractType);
    }
    return dbContractType;
  }
}