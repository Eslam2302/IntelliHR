import type { PaginatedResponse } from "./api";
import type { JobPost } from "./job-post";

export interface HiringStage {
    id: number;
    job_id?: number | null;
    job?: JobPost | null;
    stage_name: string;
    order: number;
    created_at?: string | null;
    updated_at?: string | null;
}

export type HiringStageListResponse = PaginatedResponse<HiringStage>;
