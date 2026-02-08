import type { PaginatedResponse } from "./api";

export interface Expense {
    id: number;
    employee_id: number;
    employee?: {
        id: number;
        name?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
    } | null;
    category_id: number;
    category?: {
        id: number;
        name: string;
    } | null;
    amount: number;
    expense_date?: string | null;
    status?: string | null;
    notes?: string | null;
    receipt_path?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type ExpenseListResponse = PaginatedResponse<Expense>;
