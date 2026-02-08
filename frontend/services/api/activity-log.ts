import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Activity, ActivityListResponse } from "@/lib/types/activity";

export interface GetActivityLogParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  module?: string;
  subject_id?: number;
  subject_type?: string;
  employee_id?: number;
}

export async function getActivityLog(params: GetActivityLogParams = {}): Promise<ActivityListResponse> {
  const {
    page = 1,
    perPage = 20,
    search,
    sortBy,
    sortOrder,
    module,
    subject_id,
    subject_type,
    employee_id,
  } = params;
  const url = buildQueryParams(`${API_URL}/activity-log`, {
    page,
    perPage,
    search,
    sortBy,
    sortOrder,
    module,
    subject_id,
    subject_type,
    employee_id,
  });
  const response = await fetchWithAuth(url);
  return transformLaravelResponse<Activity>(response, page, perPage);
}
