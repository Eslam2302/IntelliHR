import type { PaginatedResponse } from "./api";

export interface Contract {
    id: number;
    employee_id: number;
    employee?: { id: number; name: string } | null;
    contract_type: string;
    start_date: string;
    end_date: string | null;
    probation_period_days: number | null;
    salary: number;
    terms: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type ContractListResponse = PaginatedResponse<Contract>;
