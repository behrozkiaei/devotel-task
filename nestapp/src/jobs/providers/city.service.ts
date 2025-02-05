import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City, State } from '../entity/jobs.entity';


@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) {}

  async findOrCreate(cityName: string, state: State): Promise<City> {
    let dbCity = await this.cityRepository.findOne({
      where: { name: cityName}
    });

    if (!dbCity) {
      const newCity = this.cityRepository.create({
        name: cityName,state
      });
      dbCity = await this.cityRepository.save(newCity);
    }

    return dbCity;
  }
}