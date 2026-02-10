import { API_URL } from "@/config/api";
import { fetchWithAuth, fetchWithAuthFormData, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Expense, ExpenseListResponse } from "@/lib/types/expense";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateExpenseData {
    employee_id: number;
    category_id: number;
    amount: number;
    expense_date: string;
    status?: string | null;
    notes?: string | null;
    /**
     * Receipt file to upload or receipt path string (sent as multipart/form-data under `receipt_path`).
     */
    receipt_path?: File | string | null;
}

export interface UpdateExpenseData {
    employee_id?: number;
    category_id?: number;
    amount?: number;
    expense_date?: string;
    status?: string | null;
    notes?: string | null;
    /**
     * Optional receipt file to upload or receipt path string.
     */
    receipt_path?: File | string | null;
}

export interface GetExpensesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    status?: string;
    employee_id?: number;
}

export async function getExpenses(params: GetExpensesParams = {}): Promise<ExpenseListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        status,
        employee_id,
    } = params;
    const url = buildQueryParams(`${API_URL}/expenses`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        status,
        employee_id,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Expense>(response, page, perPage);
}

export async function getExpense(id: number): Promise<Expense> {
    const data = await fetchWithAuth(`${API_URL}/expenses/${id}`);
    return data.data ?? data;
}

export async function getEmployeeExpenses(employeeId: number, params: GetExpensesParams = {}): Promise<ExpenseListResponse> {
    const {
        page = 1,
        perPage = 15,
    } = params;
    const url = buildQueryParams(`${API_URL}/employees/${employeeId}/expenses`, {
        page,
        perPage,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Expense>(response, page, perPage);
}

export async function createExpense(payload: CreateExpenseData & { receipt_path?: File | null }): Promise<ApiResponse<Expense>> {
    const formData = new FormData();

    formData.append("employee_id", String(payload.employee_id));
    formData.append("category_id", String(payload.category_id));
    formData.append("amount", String(payload.amount));
    formData.append("expense_date", payload.expense_date);

    if (payload.status != null) {
        formData.append("status", payload.status);
    }
    if (payload.notes != null) {
        formData.append("notes", payload.notes);
    }

    // Prefer file upload when provided; otherwise allow explicit receipt_path.
    if (payload.receipt_path instanceof File) {
        formData.append("receipt_path", payload.receipt_path);
    } else if (payload.receipt_path && typeof payload.receipt_path === "string") {
        formData.append("receipt_path", payload.receipt_path);
    }

    return fetchWithAuthFormData(`${API_URL}/expenses`, formData, "POST");
}

export async function updateExpense(id: number, payload: UpdateExpenseData & { receipt_path?: File | null }): Promise<ApiResponse<Expense>> {
    const formData = new FormData();

    if (payload.employee_id != null) {
        formData.append("employee_id", String(payload.employee_id));
    }
    if (payload.category_id != null) {
        formData.append("category_id", String(payload.category_id));
    }
    if (payload.amount != null) {
        formData.append("amount", String(payload.amount));
    }
    if (payload.expense_date != null) {
        formData.append("expense_date", payload.expense_date);
    }
    if (payload.status != null) {
        formData.append("status", payload.status);
    }
    // Notes is required on update, so always send it
    // Backend requires the field to be present and non-empty
    // Ensure we always send notes, even if it's an empty string (backend validation will catch empty)
    const notesToSend = payload.notes !== undefined && payload.notes !== null 
        ? String(payload.notes).trim() 
        : "";
    
    // Debug: Log what we're sending (remove in production)
    if (process.env.NODE_ENV === 'development') {
        console.log('Sending notes to backend:', { notes: notesToSend, original: payload.notes });
    }
    
    formData.append("notes", notesToSend);

    // Only send receipt_path if it's a File (new upload)
    // Don't send existing string paths - backend will keep existing if not provided
    if (payload.receipt_path instanceof File) {
        formData.append("receipt_path", payload.receipt_path);
    }

    // Use POST for FormData updates (more reliable than PUT with FormData)
    return fetchWithAuthFormData(`${API_URL}/expenses/${id}`, formData, "POST");
}

export async function deleteExpense(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/expenses/${id}`, { method: "DELETE" });
}
