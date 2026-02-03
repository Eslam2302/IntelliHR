import type { PaginatedResponse } from "./api";

export interface Payroll {
    id: number;
    employee_id: number;
    employee?: { id: number; name: string; deleted_at?: string | null } | null;
    year: number;
    month: number;
    basic_salary: number;
    total_allowances: number;
    total_deductions: number;
    net_pay: number;
    payment_status: string;
    processed_at?: string | null;
    paid_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type PayrollListResponse = PaginatedResponse<Payroll>;
