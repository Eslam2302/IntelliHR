import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams } from "@/lib/utils/api";
import type { ReviewRating, ReviewRatingListResponse } from "@/lib/types/review-rating";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateReviewRatingData {
    performance_review_id: number;
    competency_id: number;
    self_rating?: number | null;
    self_rating_comment?: string | null;
    manager_rating?: number | null;
    manager_rating_comment?: string | null;
}

export interface UpdateReviewRatingData {
    performance_review_id?: number;
    competency_id?: number;
    self_rating?: number | null;
    self_rating_comment?: string | null;
    manager_rating?: number | null;
    manager_rating_comment?: string | null;
}

export interface GetReviewRatingsParams {
    performance_review_id?: number;
    competency_id?: number;
}

export async function getReviewRatings(params: GetReviewRatingsParams = {}): Promise<ReviewRatingListResponse> {
    const url = buildQueryParams(`${API_URL}/review-ratings`, params);
    const response = await fetchWithAuth(url);
    // Review ratings endpoint returns a simple array, not paginated
    if (Array.isArray(response.data)) {
        return {
            data: response.data,
            current_page: 1,
            per_page: response.data.length,
            total: response.data.length,
            last_page: 1,
        };
    }
    return {
        data: [],
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    };
}

export async function getReviewRating(id: number): Promise<ReviewRating> {
    const data = await fetchWithAuth(`${API_URL}/review-ratings/${id}`);
    return data.data ?? data;
}

export async function createReviewRating(payload: CreateReviewRatingData): Promise<ApiResponse<ReviewRating>> {
    return fetchWithAuth(`${API_URL}/review-ratings`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateReviewRating(id: number, payload: UpdateReviewRatingData): Promise<ApiResponse<ReviewRating>> {
    return fetchWithAuth(`${API_URL}/review-ratings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteReviewRating(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/review-ratings/${id}`, { method: "DELETE" });
}
