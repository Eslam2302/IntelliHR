import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { GoalProgressUpdate, GoalProgressUpdateListResponse } from "@/lib/types/goal-progress-update";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateGoalProgressUpdateData {
  update_note: string;
  progress_percentage: number;
  status: "on_track" | "at_risk" | "blocked" | "completed";
  update_date?: string;
}

export interface GetGoalProgressUpdatesParams {
  page?: number;
  perPage?: number;
  goal_id?: number;
}

export async function getGoalProgressUpdates(
  params: GetGoalProgressUpdatesParams = {}
): Promise<GoalProgressUpdateListResponse> {
  const { page = 1, perPage = 10, goal_id } = params;
  const url = buildQueryParams(`${API_URL}/goal-progress-updates`, {
    page,
    perPage,
    goal_id,
  });
  const response = await fetchWithAuth(url);
  return transformLaravelResponse<GoalProgressUpdate>(response, page, perPage);
}

export async function createGoalProgressUpdate(
  goalId: number,
  payload: CreateGoalProgressUpdateData
): Promise<ApiResponse<GoalProgressUpdate>> {
  return fetchWithAuth(`${API_URL}/goals/${goalId}/progress-updates`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
