import type { PaginatedResponse } from "./api";

export interface Benefit {
    id: number;
    employee_id: number;
    employee?: { id: number; name: string; deleted_at?: string | null } | null;
    benefit_type: string;
    amount: number;
    is_deduction: boolean;
    start_date: string;
    end_date: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type BenefitListResponse = PaginatedResponse<Benefit>;
