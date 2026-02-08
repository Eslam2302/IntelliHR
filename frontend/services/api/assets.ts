import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Asset, AssetListResponse } from "@/lib/types/asset";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateAssetData {
    name: string;
    serial_number: string;
    condition?: string | null;
    status?: string | null;
}

export interface UpdateAssetData {
    name?: string;
    serial_number?: string;
    condition?: string | null;
    status?: string | null;
}

export interface GetAssetsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    status?: string;
}

export async function getAssets(params: GetAssetsParams = {}): Promise<AssetListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        status,
    } = params;
    const url = buildQueryParams(`${API_URL}/assets`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        status,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Asset>(response, page, perPage);
}

export async function getAsset(id: number): Promise<Asset> {
    const data = await fetchWithAuth(`${API_URL}/assets/${id}`);
    return data.data ?? data;
}

export async function createAsset(payload: CreateAssetData): Promise<ApiResponse<Asset>> {
    return fetchWithAuth(`${API_URL}/assets`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAsset(id: number, payload: UpdateAssetData): Promise<ApiResponse<Asset>> {
    return fetchWithAuth(`${API_URL}/assets/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteAsset(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/assets/${id}`, { method: "DELETE" });
}
