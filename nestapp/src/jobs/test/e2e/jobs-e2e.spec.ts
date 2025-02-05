import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { Job, JobSkill, JobContractType, Skill, ContractType, Company, City, State, Industry } from '../../entity/jobs.entity';
import { UnifiedJobDto } from '../../dto/unified-job.dto';
import { JobFilterDto } from '../../dto/job-filter.dto';
import { createTestingModule } from '../test.helper';

describe('Jobs Module (e2e)', () => {
  let app: INestApplication;
  let jobRepository: Repository<Job>;
  let jobSkillRepository: Repository<JobSkill>;
  let jobContractTypeRepository: Repository<JobContractType>;
  let skillRepository: Repository<Skill>;
  let contractTypeRepository: Repository<ContractType>;
  let companyRepository: Repository<Company>;
  let cityRepository: Repository<City>;
  let stateRepository: Repository<State>;
  let industryRepository: Repository<Industry>;

  const mockJob: UnifiedJobDto = {
    jobId: 'P1-717',
    title: 'Backend Engineer',
    city: 'Austin',
    state: 'TX',
    fullAddress: 'Austin, TX',
    remote: false,
    compensation: {
      min: 56000,
      max: 113000,
      currency: 'USD',
      salaryRange: '$56k - $113k'
    },
    contractType: ['Contract'],
    company: { name: 'BackEnd Solutions', website: '' },
    industry: 'Solutions',
    skills: ['Python', 'Machine Learning', 'SQL'],
    postedDate: '2025-01-26T22:11:39.242Z',
    experience: 0
  };

  beforeAll(async () => {
    const moduleFixture = await createTestingModule();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    
      
      await app.close();
  });

  describe('Job Insertion and Retrieval Flow', () => {
    beforeEach(async () => {
      // Insert mock job through scheduler
      await request(app.getHttpServer())
        .post('/jobs')
        .send(mockJob)
        .expect(201);
    });

    it('should filter jobs by company name', async () => {
      const filters: JobFilterDto = {
        company: 'BackEnd Solutions',
        page: 1,
        limit: 10
      };

      const response = await request(app.getHttpServer())
        .get('/api/job-offers')
        .query(filters)
        .expect(200);
      // console.log(response.body)
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].company.name).toBe('BackEnd Solutions');
    });

    it('should filter jobs by skills', async () => {
      const filters: JobFilterDto = {
        skills: ['Python'],
        page: 1,
        limit: 10
      };

      const response = await request(app.getHttpServer())
        .get('/api/job-offers')
        .query(filters)
        .expect(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body.data[0].jobSkills)).toContain('Python');
    });

    it('should filter jobs by contract type', async () => {
      const filters: JobFilterDto = {
        contractTypes: ['Contract'],
        page: 1,
        limit: 10
      };

      const response = await request(app.getHttpServer())
        .get('/api/job-offers')
        .query(filters)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(JSON.stringify(response.body.data[0].jobContractTypes)).toContain('Contract');
    });

    it('should combine multiple filters', async () => {
      const filters: JobFilterDto = {
        company: 'BackEnd Solutions',
        skills: ['Python'],
        contractTypes: ['Contract'],
        page: 1,
        limit: 10
      };

      const response = await request(app.getHttpServer())
        .get('/api/job-offers')
        .query(filters)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].company.name).toBe('BackEnd Solutions');
      expect(JSON.stringify(response.body.data[0].jobSkills)).toContain('Python');
      expect(JSON.stringify(response.body.data[0].jobContractTypes)).toContain('Contract');
    });
  });
}); 