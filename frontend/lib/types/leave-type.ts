import type { PaginatedResponse } from "./api";

export interface LeaveType {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    annual_entitlement: number;
    accrual_policy: "none" | "monthly" | "annual";
    carry_over_limit: number;
    min_request_days: number;
    max_request_days: number;
    requires_hr_approval: boolean;
    requires_attachment: boolean;
    payment_type: "paid" | "unpaid" | "partially_paid";
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type LeaveTypeListResponse = PaginatedResponse<LeaveType>;
