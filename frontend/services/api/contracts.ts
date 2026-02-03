import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Contract, ContractListResponse } from "@/lib/types/contract";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateContractData {
    employee_id: number;
    start_date: string;
    end_date?: string | null;
    contract_type: string;
    salary: number;
    terms?: string | null;
    probation_period_days?: number | null;
}

export interface UpdateContractData {
    end_date?: string | null;
    contract_type?: string;
    salary?: number;
    terms?: string | null;
    probation_period_days?: number | null;
}

export interface GetContractsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getContracts(params: GetContractsParams = {}): Promise<ContractListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/contracts`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Contract>(response, page, perPage);
}

export async function getContract(id: number): Promise<Contract> {
    const data = await fetchWithAuth(`${API_URL}/contracts/${id}`);
    return data.data ?? data;
}

export async function createContract(payload: CreateContractData): Promise<ApiResponse<Contract>> {
    return fetchWithAuth(`${API_URL}/contracts`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateContract(id: number, payload: UpdateContractData): Promise<ApiResponse<Contract>> {
    return fetchWithAuth(`${API_URL}/contracts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteContract(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/contracts/${id}`, { method: "DELETE" });
}
