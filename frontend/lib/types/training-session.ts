import type { PaginatedResponse } from "./api";

export interface TrainingSession {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    trainer_id?: number | null;
    department_id?: number | null;
    description?: string | null;
    trainer?: { id: number; name?: string } | null;
    department?: { id: number; name: string } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type TrainingSessionListResponse = PaginatedResponse<TrainingSession>;
