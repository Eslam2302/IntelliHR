import type { PaginatedResponse } from "./api";

export interface GoalProgressUpdateUpdatedBy {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
}

export interface GoalProgressUpdate {
  id: number;
  update_note: string;
  progress_percentage: number;
  status: "on_track" | "at_risk" | "blocked" | "completed";
  update_date: string;
  updated_by?: GoalProgressUpdateUpdatedBy | null;
  created_at: string;
}

export type GoalProgressUpdateListResponse = PaginatedResponse<GoalProgressUpdate>;
