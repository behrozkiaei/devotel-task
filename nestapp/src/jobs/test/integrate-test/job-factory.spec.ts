import { Test } from '@nestjs/testing';
import { JobFactory } from '../../strategies/job-conversion.factory';
import { UnifiedJobDto } from '../../dto/unified-job.dto';

describe('JobFactory', () => {
  const provider1Response = {
    metadata: {
      requestId: "req-ijubkxwdm",
      timestamp: "2025-02-04T15:02:34.791Z"
    },
    jobs: [
      {
        jobId: "P1-725",
        title: "Backend Engineer",
        details: {
          location: "San Francisco, CA",
          type: "Part-Time",
          salaryRange: "$75k - $134k"
        },
        company: {
          name: "Creative Design Ltd",
          industry: "Solutions"
        },
        skills: ["Python", "Machine Learning", "SQL"],
        postedDate: "2025-01-25T23:58:04.906Z"
      }
    ]
  };

  const provider2Response = {
    status: "success",
    data: {
      jobsList: {
        "job-480": {
          position: "Backend Engineer",
          location: {
            city: "Austin",
            state: "CA",
            remote: false
          },
          compensation: {
            min: 74000,
            max: 121000,
            currency: "USD"
          },
          employer: {
            companyName: "DataWorks",
            website: "https://backendsolutions.com"
          },
          requirements: {
            experience: 3,
            technologies: ["Java", "Spring Boot", "AWS"]
          },
          datePosted: "2025-01-27"
        }
      }
    }
  };

  describe('createFromAnyResponse', () => {
    it('should convert provider1 response to UnifiedJobDto', () => {
      const result = JobFactory.createFromAnyResponse(provider1Response, 'provider1');
      
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        jobId: 'P1-725',
        title: 'Backend Engineer',
        city: 'San Francisco',
        state: 'CA',
        fullAddress: 'San Francisco, CA',
        remote: false,
        company: {
          name: 'Creative Design Ltd',
          website: ''
        },
        skills: ['Python', 'Machine Learning', 'SQL'],
        postedDate: '2025-01-25T23:58:04.906Z'
      });
    });

    it('should convert provider2 response to UnifiedJobDto', () => {
      const result = JobFactory.createFromAnyResponse(provider2Response, 'provider2');
      
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        jobId: 'job-480',
        title: 'Backend Engineer',
        city: 'Austin',
        state: 'CA',
        fullAddress: 'Austin, CA',
        remote: false,
        compensation: {
          min: 74000,
          max: 121000,
          currency: 'USD',
          salaryRange: '$74k - $121k'
        },
        company: {
          name: 'DataWorks',
          website: 'https://backendsolutions.com'
        },
        skills: ['Java', 'Spring Boot', 'AWS'],
        experience: 3,
        postedDate: '2025-01-27'
      });
    });

    it('should throw error for unsupported provider', () => {
      expect(() => {
        JobFactory.createFromAnyResponse({}, 'unknown-provider')
      }).toThrow('Unsupported response format');
    });
  });
}); 