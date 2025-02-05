export class JobResponseDto {
    id: number;
    title: string;
    remote: boolean;
    experience: string;
    city_name: string;
    state_name: string;
    full_address: string;
    compensation_min: number;
    compensation_max: number;
    compensation_currency: string;
    compensation_salary_range: string;
    company_name: string;
    company_website: string;
    industry_name: string;
    skill_names: string[];
    contract_types: string[];
    posted_date: Date;
} 