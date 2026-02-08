import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { PerformanceReview, PerformanceReviewListResponse } from "@/lib/types/performance-review";
import type { ApiResponse } from "@/lib/types/api";

export interface CreatePerformanceReviewData {
    evaluation_cycle_id: number;
    employee_id: number;
    reviewer_id?: number | null;
    status?: "not_started" | "self_assessment_in_progress" | "self_assessment_submitted" | "manager_review_in_progress" | "manager_review_submitted" | "awaiting_acknowledgment" | "acknowledged" | "completed" | null;
    self_assessment_summary?: string | null;
    self_assessment_achievements?: string[] | null;
    self_assessment_challenges?: string[] | null;
    self_assessment_goals?: string[] | null;
    manager_summary?: string | null;
    manager_strengths?: string[] | null;
    manager_areas_for_improvement?: string[] | null;
    manager_goals_for_next_period?: string[] | null;
    manager_additional_comments?: string | null;
    overall_rating?: string | null;
    overall_score?: number | null;
    promotion_recommended?: boolean | null;
    salary_increase_percentage?: number | null;
    bonus_amount?: number | null;
    recommended_training?: string[] | null;
    development_plan?: string[] | null;
    employee_acknowledgment_comments?: string | null;
}

export interface UpdatePerformanceReviewData {
    evaluation_cycle_id?: number;
    employee_id?: number;
    reviewer_id?: number | null;
    status?: "not_started" | "self_assessment_in_progress" | "self_assessment_submitted" | "manager_review_in_progress" | "manager_review_submitted" | "awaiting_acknowledgment" | "acknowledged" | "completed" | null;
    self_assessment_summary?: string | null;
    self_assessment_achievements?: string[] | null;
    self_assessment_challenges?: string[] | null;
    self_assessment_goals?: string[] | null;
    manager_summary?: string | null;
    manager_strengths?: string[] | null;
    manager_areas_for_improvement?: string[] | null;
    manager_goals_for_next_period?: string[] | null;
    manager_additional_comments?: string | null;
    overall_rating?: string | null;
    overall_score?: number | null;
    promotion_recommended?: boolean | null;
    salary_increase_percentage?: number | null;
    bonus_amount?: number | null;
    recommended_training?: string[] | null;
    development_plan?: string[] | null;
    employee_acknowledgment_comments?: string | null;
}

export interface GetPerformanceReviewsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getPerformanceReviews(params: GetPerformanceReviewsParams = {}): Promise<PerformanceReviewListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/performance-reviews`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<PerformanceReview>(response, page, perPage);
}

export async function getPerformanceReview(id: number): Promise<PerformanceReview> {
    const data = await fetchWithAuth(`${API_URL}/performance-reviews/${id}`);
    return data.data ?? data;
}

export async function createPerformanceReview(payload: CreatePerformanceReviewData): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updatePerformanceReview(id: number, payload: UpdatePerformanceReviewData): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deletePerformanceReview(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/performance-reviews/${id}`, { method: "DELETE" });
}

export interface SubmitSelfAssessmentData {
    self_assessment_summary?: string | null;
    self_assessment_achievements?: string[] | null;
    self_assessment_challenges?: string[] | null;
    self_assessment_goals?: string[] | null;
}

export interface SubmitManagerReviewData {
    manager_summary?: string | null;
    manager_strengths?: string[] | null;
    manager_areas_for_improvement?: string[] | null;
    manager_goals_for_next_period?: string[] | null;
    manager_additional_comments?: string | null;
    overall_rating?: string | null;
    overall_score?: number | null;
    promotion_recommended?: boolean;
    salary_increase_percentage?: number | null;
    bonus_amount?: number | null;
    recommended_training?: string[] | null;
    development_plan?: string[] | null;
}

export async function startSelfAssessment(id: number): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}/start-self-assessment`, {
        method: "POST",
    });
}

export async function submitSelfAssessment(id: number, payload: SubmitSelfAssessmentData): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}/submit-self-assessment`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function startManagerReview(id: number): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}/start-manager-review`, {
        method: "POST",
    });
}

export async function submitManagerReview(id: number, payload: SubmitManagerReviewData): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}/submit-manager-review`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export interface AcknowledgeReviewData {
    employee_acknowledgment_comments?: string | null;
}

export async function acknowledgeReview(id: number, payload: AcknowledgeReviewData = {}): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}/acknowledge`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function completeReview(id: number): Promise<ApiResponse<PerformanceReview>> {
    return fetchWithAuth(`${API_URL}/performance-reviews/${id}/complete`, {
        method: "POST",
    });
}
