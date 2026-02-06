import type { PaginatedResponse } from "./api";

export interface JobPost {
    id: number;
    title: string;
    description?: string | null;
    requirements?: string | null;
    responsibilities?: string | null;
    department_id?: number | null;
    department?: { id: number; name: string } | null;
    job_type?: string | null;
    status?: string | null;
    posted_at?: string | null;
    linkedin_job_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type JobPostListResponse = PaginatedResponse<JobPost>;
