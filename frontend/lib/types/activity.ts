import type { PaginatedResponse } from "./api";

export interface Activity {
  id: number;
  action: string;
  module: string | null;
  subject: string | null;
  subject_id: number | null;
  performed_by: string;
  changes?: Record<string, unknown> | null;
  created_at: string;
}

export type ActivityListResponse = PaginatedResponse<Activity>;
