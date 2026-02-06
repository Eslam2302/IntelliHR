import type { PaginatedResponse } from "./api";

export interface EmployeeTraining {
    id: number;
    employee_id: number;
    training_id: number;
    status: string;
    completion_date?: string | null;
    employee?: { id: number; name?: string } | null;
    training_session?: { id: number; title?: string } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type EmployeeTrainingListResponse = PaginatedResponse<EmployeeTraining>;
