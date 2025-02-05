import { JobFactory } from '../../strategies/job-conversion.factory';
import { JobMapper, JobMapperV2 } from '../../strategies/job-conversion.strategy';
import { UnifiedJobDto } from '../../dto/unified-job.dto';

describe('JobFactory', () => {
  let mockUnifiedJob: UnifiedJobDto;

  const provider1Response = {
    jobs: [
      {
        id: '123',
        title: 'Software Engineer',
        // ... other job properties
      }
    ]
  };

  const provider2Response = {
    data: {
      jobsList: {
        job1: {
          id: '456',
          title: 'Frontend Developer',
          // ... other job properties
        }
      }
    }
  };

  beforeEach(() => {
    mockUnifiedJob = new UnifiedJobDto();
    jest.clearAllMocks();
    
    // Mock the static methods
    jest.spyOn(JobMapper, 'fromRawJsonToDto').mockImplementation(() => mockUnifiedJob);
    jest.spyOn(JobMapperV2, 'fromRawJsonToDto').mockImplementation(() => mockUnifiedJob);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle provider1 response format correctly', () => {
    const result = JobFactory.createFromAnyResponse(provider1Response, 'https://api.provider1.com/jobs');

    expect(result).toHaveLength(1);
    expect(JobMapper.fromRawJsonToDto).toHaveBeenCalledWith(provider1Response.jobs[0]);
    expect(result[0]).toBe(mockUnifiedJob);
  });

  test('should handle provider2 response format correctly', () => {
    const result = JobFactory.createFromAnyResponse(provider2Response, 'https://api.provider2.com/jobs');

    expect(result).toHaveLength(1);
    expect(JobMapperV2.fromRawJsonToDto).toHaveBeenCalledWith({ job1: provider2Response.data.jobsList.job1 });
    expect(result[0]).toBe(mockUnifiedJob);
  });

  test('should throw error for unsupported response format', () => {
    expect(() => {
      JobFactory.createFromAnyResponse({}, 'https://api.unknown-provider.com/jobs');
    }).toThrow('Unsupported response format');
  });
}); 