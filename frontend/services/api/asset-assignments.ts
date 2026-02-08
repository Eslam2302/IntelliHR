import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { AssetAssignment, AssetAssignmentListResponse } from "@/lib/types/asset-assignment";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateAssetAssignmentData {
    asset_id: number;
    employee_id: number;
    assigned_date: string;
    return_date?: string | null;
}

export interface UpdateAssetAssignmentData {
    asset_id?: number;
    employee_id?: number;
    assigned_date?: string;
    return_date?: string | null;
}

export interface GetAssetAssignmentsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getAssetAssignments(params: GetAssetAssignmentsParams = {}): Promise<AssetAssignmentListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/asset-assignments`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<AssetAssignment>(response, page, perPage);
}

export async function getAssetAssignment(id: number): Promise<AssetAssignment> {
    const data = await fetchWithAuth(`${API_URL}/asset-assignments/${id}`);
    return data.data ?? data;
}

export async function createAssetAssignment(payload: CreateAssetAssignmentData): Promise<ApiResponse<AssetAssignment>> {
    return fetchWithAuth(`${API_URL}/asset-assignments`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAssetAssignment(id: number, payload: UpdateAssetAssignmentData): Promise<ApiResponse<AssetAssignment>> {
    return fetchWithAuth(`${API_URL}/asset-assignments/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteAssetAssignment(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/asset-assignments/${id}`, { method: "DELETE" });
}
