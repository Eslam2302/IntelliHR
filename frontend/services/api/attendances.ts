import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Attendance, AttendanceListResponse } from "@/lib/types/attendance";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateAttendanceData {
    employee_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    location?: string;
    notes?: string;
    status?: "present" | "absent" | "half_day" | "on_leave" | "late";
    break_duration_minutes?: number;
    overtime_hours?: number;
    is_late?: boolean;
}

export interface UpdateAttendanceData {
    check_in?: string;
    check_out?: string;
    location?: string;
    notes?: string;
    status?: "present" | "absent" | "half_day" | "on_leave" | "late";
    break_duration_minutes?: number;
    overtime_hours?: number;
    is_late?: boolean;
}

export interface GetAttendancesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
    employee_id?: number;
    date?: string;
    status?: string;
}

export async function getAttendances(params: GetAttendancesParams = {}): Promise<AttendanceListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "check_in",
        sortOrder = "desc",
        deleted = "without",
        employee_id,
        date,
        status,
    } = params;

    const url = buildQueryParams(`${API_URL}/attendances`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
        employee_id,
        date,
        status,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Attendance>(response, page, perPage);
}

export async function getAttendance(id: number): Promise<Attendance> {
    const data = await fetchWithAuth(`${API_URL}/attendances/${id}`);
    return data.data ?? data;
}

export async function createAttendance(payload: CreateAttendanceData): Promise<ApiResponse<Attendance>> {
    return fetchWithAuth(`${API_URL}/attendances`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAttendance(id: number, payload: UpdateAttendanceData): Promise<ApiResponse<Attendance>> {
    return fetchWithAuth(`${API_URL}/attendances/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteAttendance(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/attendances/${id}`, { method: "DELETE" });
}

/** Team attendances (manager's direct reports). Requires view-employees-leave-request. */
export async function getTeamAttendances(params: GetAttendancesParams = {}): Promise<AttendanceListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "check_in",
        sortOrder = "desc",
        deleted = "without",
        employee_id,
        date,
        status,
    } = params;
    const url = buildQueryParams(`${API_URL}/attendances/team`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
        employee_id,
        date,
        status,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Attendance>(response, page, perPage);
}

/** Last N attendances for current user (check-in page). No permission required. */
export async function getMyRecentAttendances(limit = 5): Promise<Attendance[]> {
    const url = new URL(`${API_URL}/attendance/my-recent`);
    url.searchParams.set("limit", String(limit));
    const res = await fetchWithAuth(url.toString());
    return (res.data ?? res) as Attendance[];
}

export interface CheckInPayload {
    date?: string;
    location?: string;
    notes?: string;
    status?: "present" | "absent" | "half_day" | "on_leave" | "late";
}

export interface CheckOutPayload {
    date?: string;
    check_out?: string;
    location?: string;
    notes?: string;
    break_duration_minutes?: number;
}

export async function attendanceCheckIn(payload: CheckInPayload = {}): Promise<{ data: Attendance }> {
    const res = await fetchWithAuth(`${API_URL}/attendance/check-in`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return res as { data: Attendance };
}

export async function attendanceCheckOut(payload: CheckOutPayload = {}): Promise<{ data: Attendance }> {
    const res = await fetchWithAuth(`${API_URL}/attendance/check-out`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return res as { data: Attendance };
}
