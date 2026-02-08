import type { PaginatedResponse } from "./api";
import type { Competency } from "./competency";
import type { PerformanceReview } from "./performance-review";

export interface ReviewRating {
    id: number;
    performance_review_id?: number | null;
    performance_review?: PerformanceReview | null;
    competency_id?: number | null;
    competency?: Competency | null;
    self_rating?: number | null;
    self_rating_comment?: string | null;
    manager_rating?: number | null;
    manager_rating_comment?: string | null;
    rating_gap?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type ReviewRatingListResponse = PaginatedResponse<ReviewRating>;
