import type { PaginatedResponse } from "./api";

export interface Allowance {
    id: number;
    employee_id: number;
    payroll_id: number | null;
    employee?: { id: number; name: string; deleted_at?: string | null } | null;
    payroll?: { id: number; year: number; month: number } | null;
    type: string;
    amount: number;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type AllowanceListResponse = PaginatedResponse<Allowance>;
