import { API_URL } from "@/config/api";
import { fetchWithAuth, fetchWithAuthFormData } from "@/lib/utils/api";

export interface LeaveRequestEmployee {
    id: number;
    name: string;
    email?: string;
    phone?: string;
}

export interface LeaveRequestLeaveType {
    id: number;
    name: string;
    code: string;
}

export interface LeaveRequestManager {
    id: number;
    name: string;
}

export interface LeaveRequest {
    id: number;
    employee: LeaveRequestEmployee;
    leave_type: LeaveRequestLeaveType;
    start_date: string;
    end_date: string;
    days: number;
    reason: string | null;
    attachment: string | null;
    status: "pending" | "manager_approved" | "hr_approved" | "rejected" | "cancelled";
    manager: LeaveRequestManager | null;
    hr: LeaveRequestManager | null;
    created_at: string;
}

export interface CreateLeaveRequestPayload {
    employee_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    reason?: string;
    attachment?: File;
}

export async function createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<{ success: boolean; data: LeaveRequest; message?: string }> {
    const form = new FormData();
    form.append("employee_id", String(payload.employee_id));
    form.append("leave_type_id", String(payload.leave_type_id));
    form.append("start_date", payload.start_date);
    form.append("end_date", payload.end_date);
    if (payload.reason != null && payload.reason !== "") form.append("reason", payload.reason);
    if (payload.attachment) form.append("attachment", payload.attachment);
    return fetchWithAuthFormData(`${API_URL}/leave-requests`, form, "POST") as Promise<{
        success: boolean;
        data: LeaveRequest;
        message?: string;
    }>;
}

export interface ManagerDashboardParams {
    status?: string;
    year?: number;
}

export async function getManagerDashboard(
    managerId: number,
    params: ManagerDashboardParams = {}
): Promise<{ success: boolean; data: LeaveRequest[]; message?: string }> {
    const url = new URL(`${API_URL}/leave-requests/manager-dashboard/${managerId}`);
    if (params.status) url.searchParams.set("status", params.status);
    if (params.year != null) url.searchParams.set("year", String(params.year));
    const data = await fetchWithAuth(url.toString());
    return data as { success: boolean; data: LeaveRequest[]; message?: string };
}

export async function managerApprove(id: number): Promise<{ success: boolean; data: LeaveRequest; message?: string }> {
    return fetchWithAuth(`${API_URL}/leave-requests/${id}/manager-approve`, {
        method: "POST",
        body: JSON.stringify({}),
    }) as Promise<{ success: boolean; data: LeaveRequest; message?: string }>;
}

export async function hrApprove(id: number): Promise<{ success: boolean; data: LeaveRequest; message?: string }> {
    return fetchWithAuth(`${API_URL}/leave-requests/${id}/hr-approve`, {
        method: "POST",
        body: JSON.stringify({}),
    }) as Promise<{ success: boolean; data: LeaveRequest; message?: string }>;
}

export interface GetMyLeaveRequestsParams {
    status?: string;
    year?: number;
}

/** Logged-in user's leave requests. No permission required. */
export async function getMyLeaveRequests(params: GetMyLeaveRequestsParams = {}): Promise<LeaveRequest[]> {
    const url = new URL(`${API_URL}/leave-requests/my`);
    if (params.status) url.searchParams.set("status", params.status);
    if (params.year != null) url.searchParams.set("year", String(params.year));
    const res = await fetchWithAuth(url.toString());
    return (res.data ?? res) as LeaveRequest[];
}
