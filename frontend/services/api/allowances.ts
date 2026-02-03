import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Allowance, AllowanceListResponse } from "@/lib/types/allowance";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateAllowanceData {
    employee_id: number;
    payroll_id?: number | null;
    type: string;
    amount: number;
}

export interface UpdateAllowanceData {
    payroll_id?: number | null;
    type?: string;
    amount?: number;
}

export interface GetAllowancesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getAllowances(params: GetAllowancesParams = {}): Promise<AllowanceListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/allowances`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Allowance>(response, page, perPage);
}

export async function getAllowance(id: number): Promise<Allowance> {
    const data = await fetchWithAuth(`${API_URL}/allowances/${id}`);
    return data.data ?? data;
}

export async function getAllowancesByEmployee(employeeId: number, params: GetAllowancesParams = {}): Promise<AllowanceListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/allowances/employee/${employeeId}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Allowance>(response, page, perPage);
}

export async function getAllowancesByPayroll(payrollId: number, params: GetAllowancesParams = {}): Promise<AllowanceListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/allowances/payroll/${payrollId}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Allowance>(response, page, perPage);
}

export async function createAllowance(payload: CreateAllowanceData): Promise<ApiResponse<Allowance>> {
    return fetchWithAuth(`${API_URL}/allowances`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAllowance(id: number, payload: UpdateAllowanceData): Promise<ApiResponse<Allowance>> {
    return fetchWithAuth(`${API_URL}/allowances/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteAllowance(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/allowances/${id}`, { method: "DELETE" });
}
