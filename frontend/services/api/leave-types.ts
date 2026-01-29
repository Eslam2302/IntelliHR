import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { LeaveType, LeaveTypeListResponse } from "@/lib/types/leave-type";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateLeaveTypeData {
    name: string;
    code: string;
    description?: string;
    annual_entitlement: number;
    accrual_policy: "none" | "monthly" | "annual";
    carry_over_limit: number;
    min_request_days: number;
    max_request_days: number;
    requires_hr_approval: boolean;
    requires_attachment: boolean;
    payment_type: "paid" | "unpaid" | "partially_paid";
    is_active?: boolean;
}

export interface UpdateLeaveTypeData {
    name?: string;
    code?: string;
    description?: string;
    annual_entitlement?: number;
    accrual_policy?: "none" | "monthly" | "annual";
    carry_over_limit?: number;
    min_request_days?: number;
    max_request_days?: number;
    requires_hr_approval?: boolean;
    requires_attachment?: boolean;
    payment_type?: "paid" | "unpaid" | "partially_paid";
    is_active?: boolean;
}

export interface GetLeaveTypesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getLeaveTypes(params: GetLeaveTypesParams = {}): Promise<LeaveTypeListResponse> {
    const {
        page = 1,
        perPage = 10,
        search,
        sortBy = "id",
        sortOrder = "asc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/leave-types`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<LeaveType>(response, page, perPage);
}

export async function getLeaveType(id: number): Promise<LeaveType> {
    const data = await fetchWithAuth(`${API_URL}/leave-types/${id}`);
    return data.data ?? data;
}

/**
 * Active leave types for dropdowns (e.g. create leave request). No permission required.
 */
export async function getActiveLeaveTypes(): Promise<LeaveType[]> {
    const res = await fetchWithAuth(`${API_URL}/leave-types/active`);
    const raw = res.data ?? res;
    return Array.isArray(raw) ? raw : [];
}

export async function createLeaveType(payload: CreateLeaveTypeData): Promise<ApiResponse<LeaveType>> {
    return fetchWithAuth(`${API_URL}/leave-types`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateLeaveType(id: number, payload: UpdateLeaveTypeData): Promise<ApiResponse<LeaveType>> {
    return fetchWithAuth(`${API_URL}/leave-types/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteLeaveType(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/leave-types/${id}`, { method: "DELETE" });
}
