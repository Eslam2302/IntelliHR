import type { PaginatedResponse } from "./api";

export interface TrainingCertificate {
    id: number;
    employee_training_id: number;
    issued_at: string;
    certificate_path?: string | null;
    employee_training?: {
        id: number;
        employee_name?: string | null;
        training_title?: string | null;
        display_label?: string;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type TrainingCertificateListResponse = PaginatedResponse<TrainingCertificate>;
