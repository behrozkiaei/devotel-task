import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinTable, PrimaryColumn } from 'typeorm';

// State Entity
@Entity()
export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => City, city => city.state)
    cities: City[];
}

// City Entity
@Entity()
export class City {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => State, state => state.cities)
    state: State;
}

// Company Entity
@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    website: string;
}

// ContractType Entity
@Entity()
export class ContractType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true , default : "Full-Time" })
    type: string;
}

// Industry Entity
@Entity()
export class Industry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true , default: "Not-Defined" })
    name: string;
}

// Skill Entity
@Entity()
export class Skill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;
}

// Job Entity
@Entity()
export class Job {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    jobId: string;

    @Column()
    title: string;

    @Column()
    remote: boolean;

    @Column({ nullable: true })
    experience: number;

    @ManyToOne(() => City)
    city: City;

    @Column({ nullable: true })
    full_address: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    compensation_min: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    compensation_max: number;

    @Column({ nullable: true })
    compensation_currency: string;

    @Column({ nullable: true })
    compensation_salary_range: string;

    @ManyToOne(() => Company)
    company: Company;

    @ManyToOne(() => Industry)
    industry: Industry;

    @Column()
    posted_date: Date;

    @OneToMany(() => JobContractType, jobContractType => jobContractType.job)
    jobContractTypes: JobContractType[];

    @OneToMany(() => JobSkill, jobSkill => jobSkill.job)
    jobSkills: JobSkill[];
}

// JobContractType Entity (Junction Table)
@Entity()
export class JobContractType {
    @PrimaryColumn()
    jobId: number;

    @PrimaryColumn()
    contractTypeId: number;

    @ManyToOne(() => Job, job => job.jobContractTypes)
    job: Job;

    @ManyToOne(() => ContractType)
    contractType: ContractType;
}

// JobSkill Entity (Junction Table)
@Entity()
export class JobSkill {
    @PrimaryColumn()
    jobId: number;

    @PrimaryColumn()
    skillId: number;

    @ManyToOne(() => Job, job => job.jobSkills)
    job: Job;

    @ManyToOne(() => Skill)
    skill: Skill;
}