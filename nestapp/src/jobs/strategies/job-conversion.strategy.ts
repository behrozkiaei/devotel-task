import { UnifiedJobDto } from "../dto/unified-job.dto";


export interface JobConversionStrategy {
  convert(apiResponse: any): UnifiedJobDto;
}

export class JobMapper {
  static fromRawJsonToDto(rawJob: any): UnifiedJobDto {
    // Parse location for provider1
    const [city, state] = (rawJob.details?.location || '').split(', ');

    return {
      jobId: rawJob.jobId,
      title: rawJob.title,
      city: city || '',
      state: state || '',
      fullAddress: rawJob.details?.location || '',
      remote: this.isRemote(city),
      compensation: {
        min: this.parseSalaryRange(rawJob.details?.salaryRange).min,
        max: this.parseSalaryRange(rawJob.details?.salaryRange).max,
        currency: 'USD',
        salaryRange: rawJob.details?.salaryRange || '',
      },
      contractType: rawJob.details?.type ? [rawJob.details.type] : [],
      company: {
        name: rawJob.company?.name || '',
        website: rawJob.company?.website || '',
      },
      industry: rawJob.company?.industry || '',
      skills: rawJob.skills || [],
      postedDate: rawJob.postedDate || new Date().toISOString(),
      experience: 0,
    };
  }

  private static parseSalaryRange(range: string): { min: number; max: number } {
    if (!range) return { min: 0, max: 0 };
    const matches = range.match(/\$(\d+)k\s*-\s*\$(\d+)k/);
    if (!matches) return { min: 0, max: 0 };
    return {
      min: parseInt(matches[1]) * 1000,
      max: parseInt(matches[2]) * 1000
    };
  }

  private static isRemote(city?: string): boolean {
    return city?.toLowerCase() === 'remote';
  }
}

export class JobMapperV2 {
  static fromRawJsonToDto(rawJob: any): UnifiedJobDto {
    const jobId = Object.keys(rawJob)[0];
    const job = rawJob[jobId];

    return {
      jobId,
      title: job.position,
      city: job.location?.city || '',
      state: job.location?.state || '',
      fullAddress: this.buildFullAddress(job.location?.city, job.location?.state),
      remote: job.location?.remote || false,
      compensation: {
        min: job.compensation?.min || 0,
        max: job.compensation?.max || 0,
        currency: job.compensation?.currency || 'USD',
        salaryRange: this.formatSalaryRange(job.compensation?.min, job.compensation?.max),
      },
      contractType: [],
      company: {
        name: job.employer?.companyName || '',
        website: job.employer?.website || '',
      },
      industry: '',
      skills: job.requirements?.technologies || [],
      postedDate: job.datePosted || new Date().toISOString(),
      experience: job.requirements?.experience || 0,
    };
  }

  private static buildFullAddress(city?: string, state?: string): string {
    if (!city && !state) return '';
    if (!state) return city || '';
    if (!city) return state;
    return `${city}, ${state}`;
  }

  private static isRemote(city?: string): boolean {
    return city?.toLowerCase() === 'remote';
  }

  private static formatSalaryRange(min?: number, max?: number): string {
    if (!min && !max) return '';
    const minStr = min ? `$${Math.floor(min/1000)}k` : '';
    const maxStr = max ? `$${Math.floor(max/1000)}k` : '';
    return `${minStr}${min && max ? ' - ' : ''}${maxStr}`;
  }
}