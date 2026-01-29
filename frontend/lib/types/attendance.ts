import type { PaginatedResponse } from "./api";

export interface Attendance {
    id: number;
    employee_id: number;
    employee?: { id: number; name: string | null } | null;
    date: string;
    check_in: string | null;
    check_out: string | null;
    is_late: boolean;
    calculated_hours?: number | null;
    worked_hours?: number | null;
    location: string | null;
    check_in_ip?: string | null;
    check_out_ip?: string | null;
    notes: string | null;
    status: "present" | "absent" | "half_day" | "on_leave" | "late";
    break_duration_minutes?: number | null;
    overtime_hours?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type AttendanceListResponse = PaginatedResponse<Attendance>;
