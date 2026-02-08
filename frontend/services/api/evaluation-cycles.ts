import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { EvaluationCycle, EvaluationCycleListResponse } from "@/lib/types/evaluation-cycle";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateEvaluationCycleData {
    name: string;
    type: "annual" | "semi_annual" | "quarterly" | "probation";
    year: number;
    period?: "H1" | "H2" | "Q1" | "Q2" | "Q3" | "Q4" | "full_year" | null;
    start_date: string;
    end_date: string;
    self_assessment_deadline: string;
    manager_review_deadline: string;
    calibration_deadline?: string | null;
    final_review_deadline: string;
    status?: "draft" | "published" | "self_assessment_open" | "manager_review_open" | "calibration" | "completed" | "cancelled" | null;
    rating_scale?: Array<{ min: number; max: number; label: string }> | null;
    include_self_assessment?: boolean;
    include_goals?: boolean;
    description?: string | null;
}

export interface UpdateEvaluationCycleData {
    name?: string;
    type?: "annual" | "semi_annual" | "quarterly" | "probation";
    year?: number;
    period?: "H1" | "H2" | "Q1" | "Q2" | "Q3" | "Q4" | "full_year" | null;
    start_date?: string;
    end_date?: string;
    self_assessment_deadline?: string;
    manager_review_deadline?: string;
    calibration_deadline?: string | null;
    final_review_deadline?: string;
    status?: "draft" | "published" | "self_assessment_open" | "manager_review_open" | "calibration" | "completed" | "cancelled" | null;
    rating_scale?: Array<{ min: number; max: number; label: string }> | null;
    include_self_assessment?: boolean;
    include_goals?: boolean;
    description?: string | null;
}

export interface GetEvaluationCyclesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getEvaluationCycles(params: GetEvaluationCyclesParams = {}): Promise<EvaluationCycleListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/evaluation-cycles`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<EvaluationCycle>(response, page, perPage);
}

export async function getEvaluationCycle(id: number): Promise<EvaluationCycle> {
    const data = await fetchWithAuth(`${API_URL}/evaluation-cycles/${id}`);
    return data.data ?? data;
}

export async function createEvaluationCycle(payload: CreateEvaluationCycleData): Promise<ApiResponse<EvaluationCycle>> {
    return fetchWithAuth(`${API_URL}/evaluation-cycles`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateEvaluationCycle(id: number, payload: UpdateEvaluationCycleData): Promise<ApiResponse<EvaluationCycle>> {
    return fetchWithAuth(`${API_URL}/evaluation-cycles/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteEvaluationCycle(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/evaluation-cycles/${id}`, { method: "DELETE" });
}
