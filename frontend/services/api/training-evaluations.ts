import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { TrainingEvaluation, TrainingEvaluationListResponse } from "@/lib/types/training-evaluation";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateTrainingEvaluationData {
    employee_id: number;
    training_id: number;
    rating: number;
    feedback?: string | null;
}

export interface UpdateTrainingEvaluationData {
    rating?: number;
    feedback?: string | null;
}

export interface GetTrainingEvaluationsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getTrainingEvaluations(params: GetTrainingEvaluationsParams = {}): Promise<TrainingEvaluationListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/training-evaluations`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<TrainingEvaluation>(response, page, perPage);
}

export async function getTrainingEvaluation(id: number): Promise<TrainingEvaluation> {
    const data = await fetchWithAuth(`${API_URL}/training-evaluations/${id}`);
    return data.data ?? data;
}

export async function createTrainingEvaluation(payload: CreateTrainingEvaluationData): Promise<ApiResponse<TrainingEvaluation>> {
    return fetchWithAuth(`${API_URL}/training-evaluations`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateTrainingEvaluation(id: number, payload: UpdateTrainingEvaluationData): Promise<ApiResponse<TrainingEvaluation>> {
    return fetchWithAuth(`${API_URL}/training-evaluations/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteTrainingEvaluation(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/training-evaluations/${id}`, { method: "DELETE" });
}
