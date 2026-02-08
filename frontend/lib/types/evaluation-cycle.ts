import type { PaginatedResponse } from "./api";

export interface EvaluationCycle {
    id: number;
    name: string;
    type: "annual" | "semi_annual" | "quarterly" | "probation";
    year: number;
    period?: "H1" | "H2" | "Q1" | "Q2" | "Q3" | "Q4" | "full_year" | null;
    dates: {
        start_date: string;
        end_date: string;
        self_assessment_deadline: string;
        manager_review_deadline: string;
        calibration_deadline?: string | null;
        final_review_deadline: string;
    };
    status?: "draft" | "published" | "self_assessment_open" | "manager_review_open" | "calibration" | "completed" | "cancelled" | null;
    rating_scale?: Array<{ min: number; max: number; label: string }> | null;
    include_self_assessment?: boolean;
    include_goals?: boolean;
    description?: string | null;
    created_by?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    } | null;
    reviews_count?: number | null;
    statistics?: {
        total_reviews: number;
        not_started: number;
        self_assessment_in_progress: number;
        self_assessment_submitted: number;
        manager_review_in_progress: number;
        manager_review_submitted: number;
        completed: number;
        completion_percentage: number;
        overdue_self_assessments: number;
        overdue_manager_reviews: number;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type EvaluationCycleListResponse = PaginatedResponse<EvaluationCycle>;
