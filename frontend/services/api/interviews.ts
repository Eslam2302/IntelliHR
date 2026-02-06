import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Interview, InterviewListResponse } from "@/lib/types/interview";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateInterviewData {
    applicant_id: number;
    interviewer_id?: number | null;
    scheduled_at?: string | null;
    score?: number | null;
    notes?: string | null;
    status?: string | null;
}

export interface UpdateInterviewData {
    applicant_id?: number;
    interviewer_id?: number | null;
    scheduled_at?: string | null;
    score?: number | null;
    notes?: string | null;
    status?: string | null;
}

export interface GetInterviewsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getInterviews(params: GetInterviewsParams = {}): Promise<InterviewListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/interviews`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Interview>(response, page, perPage);
}

export async function getInterview(id: number): Promise<Interview> {
    const data = await fetchWithAuth(`${API_URL}/interviews/${id}`);
    return data.data ?? data;
}

export async function createInterview(payload: CreateInterviewData): Promise<ApiResponse<Interview>> {
    return fetchWithAuth(`${API_URL}/interviews`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateInterview(id: number, payload: UpdateInterviewData): Promise<ApiResponse<Interview>> {
    return fetchWithAuth(`${API_URL}/interviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteInterview(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/interviews/${id}`, { method: "DELETE" });
}
