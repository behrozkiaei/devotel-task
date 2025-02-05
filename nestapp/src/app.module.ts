// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import configuration from './config/configuration';
import { JobScheduler } from './jobs/fetching.scheduler';
import { JobService } from './jobs/providers/jobs.service';
import { City, Company, ContractType, Industry, Job, Skill, State, JobContractType, JobSkill } from './jobs/entity/jobs.entity';

import { CompanyService } from './jobs/providers/company.service';
import { CityService } from './jobs/providers/city.service';
import { StateService } from './jobs/providers/state.service';
import { IndustryService } from './jobs/providers/industry.service';
import { SkillService } from './jobs/providers/skill.service';
import { ContractTypeService } from './jobs/providers/contractType.service';
import { JobFactory } from './jobs/strategies/job-conversion.factory';
import { JobController } from './jobs/controllers/job/jobs.controller';
import { ApiController } from './jobs/controllers/api/api.controller';
import { ApiService } from './jobs/providers/api.service';
import { CustomLoggerService } from './common/services/logger.service';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JobSkillService } from './jobs/providers/job-skill.service';
import { JobContractTypeService } from './jobs/providers/job-contract-type.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // Database type
        host: configService.get<string>('DB_HOST'), // Database host
        port: configService.get<number>('DB_PORT'), // Database port
        username: configService.get<string>('DB_USERNAME'), // Database username
        password: configService.get<string>('DB_PASSWORD'), // Database password
        database: configService.get<string>('DB_NAME'), // Database name
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Entity files
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'), // Auto-sync schema
      }),
    }),
    TypeOrmModule.forFeature([
      Job,
      Company,
      City,
      State,
      Industry,
      Skill,
      ContractType,
      JobContractType,
      JobSkill,
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [JobController, ApiController, AppController],
  providers: [
    JobScheduler,
    JobService,
    CompanyService,
    CityService,
    StateService,
    IndustryService,
    SkillService,
    ContractTypeService,
    JobFactory,
    JobService,
    ApiService,
    CustomLoggerService,
    JobSkill,
    JobContractType,
    JobSkillService,
    JobContractTypeService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
