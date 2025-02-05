// state.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '../entity/jobs.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>
  ) {}

  async findOrCreate(state: string): Promise<State> {
    let dbState = await this.stateRepository.findOne({ where: { name: state } });
    if (!dbState) {
      dbState = this.stateRepository.create({ name: state });
      await this.stateRepository.save(dbState);
    }
    return dbState;
  }
}
