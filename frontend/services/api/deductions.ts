import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Deduction, DeductionListResponse } from "@/lib/types/deduction";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateDeductionData {
    employee_id: number;
    payroll_id?: number | null;
    type: string;
    amount: number;
}

export interface UpdateDeductionData {
    payroll_id?: number | null;
    type?: string;
    amount?: number;
}

export interface GetDeductionsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getDeductions(params: GetDeductionsParams = {}): Promise<DeductionListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/deductions`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Deduction>(response, page, perPage);
}

export async function getDeduction(id: number): Promise<Deduction> {
    const data = await fetchWithAuth(`${API_URL}/deductions/${id}`);
    return data.data ?? data;
}

export async function getDeductionsByEmployee(employeeId: number, params: GetDeductionsParams = {}): Promise<DeductionListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/deductions/employee/${employeeId}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Deduction>(response, page, perPage);
}

export async function getDeductionsByPayroll(payrollId: number, params: GetDeductionsParams = {}): Promise<DeductionListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/deductions/payroll/${payrollId}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Deduction>(response, page, perPage);
}

export async function createDeduction(payload: CreateDeductionData): Promise<ApiResponse<Deduction>> {
    return fetchWithAuth(`${API_URL}/deductions`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateDeduction(id: number, payload: UpdateDeductionData): Promise<ApiResponse<Deduction>> {
    return fetchWithAuth(`${API_URL}/deductions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteDeduction(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/deductions/${id}`, { method: "DELETE" });
}
