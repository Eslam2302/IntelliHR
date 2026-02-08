import type { PaginatedResponse } from "./api";

export interface ExpenseCategory {
    id: number;
    name: string;
    created_at?: string | null;
    updated_at?: string | null;
}

export type ExpenseCategoryListResponse = PaginatedResponse<ExpenseCategory>;
