import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Competency, CompetencyListResponse } from "@/lib/types/competency";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateCompetencyData {
    name: string;
    description: string;
    category: "technical" | "behavioral" | "leadership" | "core_values";
    applicable_to: "all" | "individual_contributor" | "manager" | "senior_manager" | "executive";
    rating_descriptors: Record<number, string>; // Must have keys 1-5
    weight: number; // 1-10
    is_active?: boolean;
    display_order?: number | null;
}

export interface UpdateCompetencyData {
    name?: string;
    description?: string;
    category?: "technical" | "behavioral" | "leadership" | "core_values";
    applicable_to?: "all" | "individual_contributor" | "manager" | "senior_manager" | "executive";
    rating_descriptors?: Record<number, string> | null;
    weight?: number; // 1-10
    is_active?: boolean;
    display_order?: number | null;
}

export interface GetCompetenciesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getCompetencies(params: GetCompetenciesParams = {}): Promise<CompetencyListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/competencies`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Competency>(response, page, perPage);
}

export async function getCompetency(id: number): Promise<Competency> {
    const data = await fetchWithAuth(`${API_URL}/competencies/${id}`);
    return data.data ?? data;
}

export async function createCompetency(payload: CreateCompetencyData): Promise<ApiResponse<Competency>> {
    return fetchWithAuth(`${API_URL}/competencies`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateCompetency(id: number, payload: UpdateCompetencyData): Promise<ApiResponse<Competency>> {
    return fetchWithAuth(`${API_URL}/competencies/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteCompetency(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/competencies/${id}`, { method: "DELETE" });
}
