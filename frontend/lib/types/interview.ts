import type { PaginatedResponse } from "./api";
import type { Applicant } from "./applicant";
import type { Employee } from "./employee";

export interface Interview {
    id: number;
    applicant_id: number;
    applicant?: Applicant | null;
    interviewer_id?: number | null;
    interviewer?: Employee | null;
    scheduled_at?: string | null;
    score?: number | null;
    notes?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type InterviewListResponse = PaginatedResponse<Interview>;
