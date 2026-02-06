import type { PaginatedResponse } from "./api";

export interface TrainingEvaluation {
    id: number;
    employee_id: number;
    training_id: number;
    rating: number;
    feedback?: string | null;
    employee?: { id: number; name?: string } | null;
    training?: { id: number; title?: string } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type TrainingEvaluationListResponse = PaginatedResponse<TrainingEvaluation>;
