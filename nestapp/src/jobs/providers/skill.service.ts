

// skill.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entity/jobs.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>
  ) {}

  async findOrCreate(skill: string): Promise<Skill> {
    let dbSkill = await this.skillRepository.findOne({ where: { name: skill.toLowerCase() } });
    if (!dbSkill) {
      dbSkill = this.skillRepository.create({ name: skill });
      await this.skillRepository.save(dbSkill);
    }
    return dbSkill;
  }
}