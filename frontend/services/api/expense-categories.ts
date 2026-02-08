import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { ExpenseCategory, ExpenseCategoryListResponse } from "@/lib/types/expense-category";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateExpenseCategoryData {
    name: string;
}

export interface UpdateExpenseCategoryData {
    name?: string;
}

export interface GetExpenseCategoriesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getExpenseCategories(params: GetExpenseCategoriesParams = {}): Promise<ExpenseCategoryListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/expense-categories`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<ExpenseCategory>(response, page, perPage);
}

export async function getExpenseCategory(id: number): Promise<ExpenseCategory> {
    const data = await fetchWithAuth(`${API_URL}/expense-categories/${id}`);
    return data.data ?? data;
}

export async function createExpenseCategory(payload: CreateExpenseCategoryData): Promise<ApiResponse<ExpenseCategory>> {
    return fetchWithAuth(`${API_URL}/expense-categories`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateExpenseCategory(id: number, payload: UpdateExpenseCategoryData): Promise<ApiResponse<ExpenseCategory>> {
    return fetchWithAuth(`${API_URL}/expense-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteExpenseCategory(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/expense-categories/${id}`, { method: "DELETE" });
}
