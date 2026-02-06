import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { HiringStage, HiringStageListResponse } from "@/lib/types/hiring-stage";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateHiringStageData {
    job_id: number;
    stage_name: string;
    order: number;
}

export interface UpdateHiringStageData {
    job_id?: number;
    stage_name?: string;
    order?: number;
}

export interface GetHiringStagesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getHiringStages(params: GetHiringStagesParams = {}): Promise<HiringStageListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "order",
        sortOrder = "asc",
    } = params;
    const url = buildQueryParams(`${API_URL}/hiring-stages`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<HiringStage>(response, page, perPage);
}

export async function getHiringStage(id: number): Promise<HiringStage> {
    const data = await fetchWithAuth(`${API_URL}/hiring-stages/${id}`);
    return data.data ?? data;
}

export async function getHiringStagesByJobPost(jobPostId: number): Promise<HiringStage[]> {
    const data = await fetchWithAuth(`${API_URL}/job-posts/${jobPostId}/hiring-stages`);
    return data.data ?? data;
}

export async function createHiringStage(payload: CreateHiringStageData): Promise<ApiResponse<HiringStage>> {
    return fetchWithAuth(`${API_URL}/hiring-stages`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateHiringStage(id: number, payload: UpdateHiringStageData): Promise<ApiResponse<HiringStage>> {
    return fetchWithAuth(`${API_URL}/hiring-stages/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteHiringStage(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/hiring-stages/${id}`, { method: "DELETE" });
}
