import type { PaginatedResponse } from "./api";
import type { EvaluationCycle } from "./evaluation-cycle";
import type { ReviewRating } from "./review-rating";

export interface PerformanceReview {
    id: number;
    evaluation_cycle_id?: number | null;
    evaluation_cycle?: EvaluationCycle | null;
    employee_id?: number | null;
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    } | null;
    reviewer_id?: number | null;
    reviewer?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    } | null;
    status?: "not_started" | "self_assessment_in_progress" | "self_assessment_submitted" | "manager_review_in_progress" | "manager_review_submitted" | "awaiting_acknowledgment" | "acknowledged" | "completed" | null;
    self_assessment?: {
        summary?: string | null;
        achievements?: string[] | null;
        challenges?: string[] | null;
        goals?: string[] | null;
        submitted_at?: string | null;
    } | null;
    manager_review?: {
        summary?: string | null;
        strengths?: string[] | null;
        areas_for_improvement?: string[] | null;
        goals_for_next_period?: string[] | null;
        additional_comments?: string | null;
        submitted_at?: string | null;
    } | null;
    ratings?: ReviewRating[] | null;
    overall_rating?: string | null;
    overall_score?: number | null;
    overall_rating_label?: string | null;
    outcomes?: {
        promotion_recommended?: boolean | null;
        salary_increase_percentage?: number | null;
        bonus_amount?: number | null;
        recommended_training?: string[] | null;
        development_plan?: string[] | null;
    } | null;
    acknowledgment?: {
        acknowledged_at?: string | null;
        comments?: string | null;
    } | null;
    metadata?: {
        can_employee_edit?: boolean;
        can_manager_edit?: boolean;
        can_employee_acknowledge?: boolean;
        can_complete?: boolean;
        is_overdue?: boolean;
        days_until_deadline?: number | null;
        is_current_user_employee?: boolean;
        is_current_user_reviewer?: boolean;
    } | null;
    completed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type PerformanceReviewListResponse = PaginatedResponse<PerformanceReview>;
