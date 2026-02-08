import type { PaginatedResponse } from "./api";
import type { EvaluationCycle } from "./evaluation-cycle";

export interface GoalProgressUpdate {
    id: number;
    goal_id?: number | null;
    updated_by?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    } | null;
    update_note?: string | null;
    progress_percentage?: number | null;
    status?: string | null;
    update_date?: string | null;
    created_at?: string | null;
}

export interface Goal {
    id: number;
    employee_id?: number | null;
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    } | null;
    evaluation_cycle_id?: number | null;
    evaluation_cycle?: EvaluationCycle | null;
    set_by?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    } | null;
    title: string;
    description?: string | null;
    type?: "individual" | "team" | "departmental" | "company" | null;
    category?: "performance" | "development" | "behavioral" | null;
    success_criteria?: Array<{ criterion: string; target?: string }> | string[] | null;
    dates?: {
        start_date: string;
        target_date: string;
    } | null;
    start_date?: string | null;
    target_date?: string | null;
    weight?: number | null;
    status?: "not_started" | "in_progress" | "at_risk" | "completed" | "cancelled" | null;
    progress_percentage?: number | null;
    completion?: {
        notes?: string | null;
        achievement_level?: "exceeded" | "fully_achieved" | "partially_achieved" | "not_achieved" | null;
        self_rating?: number | null;
        manager_rating?: number | null;
        manager_comments?: string | null;
    } | null;
    completion_notes?: string | null;
    achievement_level?: "exceeded" | "fully_achieved" | "partially_achieved" | "not_achieved" | null;
    self_rating?: number | null;
    manager_rating?: number | null;
    manager_comments?: string | null;
    progress_updates?: GoalProgressUpdate[] | null;
    metadata?: {
        is_overdue?: boolean;
        days_remaining?: number | null;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type GoalListResponse = PaginatedResponse<Goal>;
