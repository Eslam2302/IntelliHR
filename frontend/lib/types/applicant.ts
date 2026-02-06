import type { PaginatedResponse } from "./api";
import type { JobPost } from "./job-post";
import type { HiringStage } from "./hiring-stage";

export interface Applicant {
    id: number;
    job_id: number;
    job?: JobPost | null;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    is_employee?: boolean;
    status?: string | null;
    source?: string | null;
    experience_years?: number | null;
    current_stage_id?: number | null;
    current_stage?: HiringStage | null;
    resume_path?: string | null;
    applied_at?: string | null;
    ai_score?: number | null;
    ai_recommendation?: string | null;
    ai_analysis_status?: string | null;
    ai_analyzed_at?: string | null;
    ai_summary?: {
        matched_skills?: string[] | null;
        missing_skills?: string[] | null;
        overall_assessment?: string | null;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type ApplicantListResponse = PaginatedResponse<Applicant>;
