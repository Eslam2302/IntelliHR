import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Payroll, PayrollListResponse } from "@/lib/types/payroll";
import type { ApiResponse } from "@/lib/types/api";

export interface CreatePayrollData {
    employee_id: number;
    year: number;
    month: number;
    basic_salary: number;
    total_allowances?: number;
    total_deductions?: number;
}

export interface UpdatePayrollData {
    basic_salary?: number;
    total_allowances?: number;
    total_deductions?: number;
    payment_status?: string;
}

export interface GetPayrollsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
    year?: number;
    month?: number;
}

export async function getPayrolls(params: GetPayrollsParams = {}): Promise<PayrollListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
        year,
        month,
    } = params;
    const url = buildQueryParams(`${API_URL}/payrolls`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
        year,
        month,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Payroll>(response, page, perPage);
}

export async function getPayroll(id: number): Promise<Payroll> {
    const data = await fetchWithAuth(`${API_URL}/payrolls/${id}`);
    return data.data ?? data;
}

export async function getPayrollsByEmployee(employeeId: number, params: GetPayrollsParams = {}): Promise<PayrollListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/payrolls/employee/${employeeId}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Payroll>(response, page, perPage);
}

export async function getPayrollsByMonth(year: number, month: number, params: GetPayrollsParams = {}): Promise<PayrollListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/payrolls/month/${year}/${month}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Payroll>(response, page, perPage);
}

export async function processPayroll(): Promise<ApiResponse<{ message: string; processed?: number }>> {
    return fetchWithAuth(`${API_URL}/payrolls/process`, {
        method: "POST",
        body: JSON.stringify({}),
    });
}

/** Process payroll payment via Stripe (POST /api/payrolls/{id}/pay). Requires stripeToken. */
export async function payPayroll(
    payrollId: number,
    stripeToken: string
): Promise<ApiResponse<{ charge_id: string; amount: number }>> {
    return fetchWithAuth(`${API_URL}/payrolls/${payrollId}/pay`, {
        method: "POST",
        body: JSON.stringify({ stripeToken }),
    });
}

export async function createPayroll(payload: CreatePayrollData): Promise<ApiResponse<Payroll>> {
    return fetchWithAuth(`${API_URL}/payrolls`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updatePayroll(id: number, payload: UpdatePayrollData): Promise<ApiResponse<Payroll>> {
    return fetchWithAuth(`${API_URL}/payrolls/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deletePayroll(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/payrolls/${id}`, { method: "DELETE" });
}
