import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Benefit, BenefitListResponse } from "@/lib/types/benefit";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateBenefitData {
    employee_id: number;
    benefit_type: string;
    amount: number;
    is_deduction: boolean;
    start_date: string;
    end_date?: string | null;
}

export interface UpdateBenefitData {
    benefit_type?: string;
    amount?: number;
    is_deduction?: boolean;
    start_date?: string;
    end_date?: string | null;
}

export interface GetBenefitsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getBenefits(params: GetBenefitsParams = {}): Promise<BenefitListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/benefits`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Benefit>(response, page, perPage);
}

export async function getBenefit(id: number): Promise<Benefit> {
    const data = await fetchWithAuth(`${API_URL}/benefits/${id}`);
    return data.data ?? data;
}

export async function getBenefitsByEmployee(employeeId: number, params: GetBenefitsParams = {}): Promise<BenefitListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/benefits/employee/${employeeId}`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Benefit>(response, page, perPage);
}

export async function createBenefit(payload: CreateBenefitData): Promise<ApiResponse<Benefit>> {
    return fetchWithAuth(`${API_URL}/benefits`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateBenefit(id: number, payload: UpdateBenefitData): Promise<ApiResponse<Benefit>> {
    return fetchWithAuth(`${API_URL}/benefits/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteBenefit(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/benefits/${id}`, { method: "DELETE" });
}
