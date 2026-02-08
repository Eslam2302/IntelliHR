import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Goal, GoalListResponse } from "@/lib/types/goal";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateGoalData {
    employee_id: number;
    evaluation_cycle_id?: number | null;
    set_by: number;
    title: string;
    description: string;
    type: "individual" | "team" | "departmental" | "company";
    category: "performance" | "development" | "behavioral";
    success_criteria: string[]; // Required, min 1 item
    start_date: string;
    target_date: string;
    weight: number; // Required, 1-10
    status?: "not_started" | "in_progress" | "at_risk" | "completed" | "cancelled" | null;
    progress_percentage?: number | null;
}

export interface UpdateGoalData {
    employee_id?: number;
    evaluation_cycle_id?: number | null;
    set_by?: number;
    title?: string;
    description?: string;
    type?: "individual" | "team" | "departmental" | "company";
    category?: "performance" | "development" | "behavioral";
    success_criteria?: string[]; // If provided, min 1 item
    start_date?: string;
    target_date?: string;
    weight?: number; // If provided, 1-10
    status?: "not_started" | "in_progress" | "at_risk" | "completed" | "cancelled";
    progress_percentage?: number | null;
    completion_notes?: string | null;
    achievement_level?: "exceeded" | "fully_achieved" | "partially_achieved" | "not_achieved" | null;
    self_rating?: number | null;
    manager_rating?: number | null;
    manager_comments?: string | null;
}

export interface GetGoalsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getGoals(params: GetGoalsParams = {}): Promise<GoalListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/goals`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Goal>(response, page, perPage);
}

export async function getGoal(id: number): Promise<Goal> {
    const data = await fetchWithAuth(`${API_URL}/goals/${id}`);
    return data.data ?? data;
}

export async function createGoal(payload: CreateGoalData): Promise<ApiResponse<Goal>> {
    return fetchWithAuth(`${API_URL}/goals`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateGoal(id: number, payload: UpdateGoalData): Promise<ApiResponse<Goal>> {
    return fetchWithAuth(`${API_URL}/goals/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteGoal(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/goals/${id}`, { method: "DELETE" });
}
