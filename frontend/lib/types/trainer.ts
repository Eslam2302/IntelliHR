import type { PaginatedResponse } from "./api";

export interface Trainer {
    id: number;
    type: string;
    employee_id?: number | null;
    employee?: { id: number; name: string; email?: string; phone?: string } | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type TrainerListResponse = PaginatedResponse<Trainer>;
