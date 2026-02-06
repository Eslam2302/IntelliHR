import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { TrainingSession, TrainingSessionListResponse } from "@/lib/types/training-session";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateTrainingSessionData {
    title: string;
    start_date: string;
    end_date: string;
    trainer_id?: number | null;
    department_id?: number | null;
    description?: string | null;
}

export interface UpdateTrainingSessionData {
    title?: string;
    start_date?: string;
    end_date?: string;
    trainer_id?: number | null;
    department_id?: number | null;
    description?: string | null;
}

export interface GetTrainingSessionsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getTrainingSessions(params: GetTrainingSessionsParams = {}): Promise<TrainingSessionListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/training-sessions`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<TrainingSession>(response, page, perPage);
}

export async function getTrainingSession(id: number): Promise<TrainingSession> {
    const data = await fetchWithAuth(`${API_URL}/training-sessions/${id}`);
    return data.data ?? data;
}

export async function createTrainingSession(payload: CreateTrainingSessionData): Promise<ApiResponse<TrainingSession>> {
    return fetchWithAuth(`${API_URL}/training-sessions`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateTrainingSession(id: number, payload: UpdateTrainingSessionData): Promise<ApiResponse<TrainingSession>> {
    return fetchWithAuth(`${API_URL}/training-sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteTrainingSession(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/training-sessions/${id}`, { method: "DELETE" });
}
