import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Trainer, TrainerListResponse } from "@/lib/types/trainer";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateTrainerData {
    type: string;
    employee_id?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
}

export interface UpdateTrainerData {
    type?: string;
    employee_id?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
}

export interface GetTrainersParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getTrainers(params: GetTrainersParams = {}): Promise<TrainerListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/trainers`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Trainer>(response, page, perPage);
}

export async function getTrainer(id: number): Promise<Trainer> {
    const data = await fetchWithAuth(`${API_URL}/trainers/${id}`);
    return data.data ?? data;
}

export async function createTrainer(payload: CreateTrainerData): Promise<ApiResponse<Trainer>> {
    return fetchWithAuth(`${API_URL}/trainers`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateTrainer(id: number, payload: UpdateTrainerData): Promise<ApiResponse<Trainer>> {
    return fetchWithAuth(`${API_URL}/trainers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteTrainer(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/trainers/${id}`, { method: "DELETE" });
}
