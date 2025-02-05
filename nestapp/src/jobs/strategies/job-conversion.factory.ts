import { UnifiedJobDto } from "../dto/unified-job.dto";
import { JobMapper, JobMapperV2 } from "./job-conversion.strategy";

export class JobFactory {
  static createFromAnyResponse(rawData: any, url: string): UnifiedJobDto[] {
    if (url.includes("provider1")) {
      return this.handleFirstResponseFormat(rawData);
    } else if (url.includes("provider2")) {
      return this.handleSecondResponseFormat(rawData);
    }
    throw new Error('Unsupported response format');
  }

  private static handleSecondResponseFormat(response: any): UnifiedJobDto[] {
    const jobs = response.data.jobsList;
    return Object.keys(jobs).map(jobKey => {
      const jobData = { [jobKey]: jobs[jobKey] };
      return JobMapperV2.fromRawJsonToDto(jobData);
    });
  }

  private static handleFirstResponseFormat(response: any): UnifiedJobDto[] {
    return response.jobs.map((job: any) => {
      return JobMapper.fromRawJsonToDto(job);
    });
  }
}