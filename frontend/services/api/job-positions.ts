import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { PaginatedResponse } from "@/lib/types/api";
import type { ApiResponse } from "@/lib/types/api";

export interface JobPosition {
    id: number;
    title: string;
    grade?: string;
    department_id?: number;
    min_salary?: number;
    max_salary?: number;
    responsibilities?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export type JobPositionListResponse = PaginatedResponse<JobPosition>;

export interface CreateJobPositionData {
    title: string;
    grade: string;
    department_id: number;
    min_salary: number;
    max_salary: number;
    responsibilities?: string;
}

export interface UpdateJobPositionData {
    title?: string;
    grade?: string;
    department_id?: number;
    min_salary?: number;
    max_salary?: number;
    responsibilities?: string;
}

export interface GetJobPositionsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getJobPositions(
    params: GetJobPositionsParams = {}
): Promise<JobPositionListResponse> {
    const {
        page = 1,
        perPage = 100,
        search,
        sortBy = "id",
        sortOrder = "asc",
        deleted = "without",
    } = params;

    const url = buildQueryParams(`${API_URL}/job-positions`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<JobPosition>(response, page, perPage);
}

export async function getJobPosition(id: number): Promise<JobPosition> {
    const data = await fetchWithAuth(`${API_URL}/job-positions/${id}`);
    return data.data ?? data;
}

export async function createJobPosition(payload: CreateJobPositionData): Promise<ApiResponse<JobPosition>> {
    return fetchWithAuth(`${API_URL}/job-positions`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateJobPosition(id: number, payload: UpdateJobPositionData): Promise<ApiResponse<JobPosition>> {
    return fetchWithAuth(`${API_URL}/job-positions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteJobPosition(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/job-positions/${id}`, { method: "DELETE" });
}
