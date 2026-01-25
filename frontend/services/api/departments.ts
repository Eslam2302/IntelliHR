import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Department, DepartmentListResponse } from "@/lib/types/department";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateDepartmentData {
    name: string;
    description?: string;
    manager_id?: number;
}

export interface UpdateDepartmentData {
    name?: string;
    description?: string;
    manager_id?: number;
}

export interface GetDepartmentsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: "id" | "name" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getDepartments(
    params: GetDepartmentsParams = {},
): Promise<DepartmentListResponse> {
    const {
        page = 1,
        perPage = 5,
        search,
        sortBy = "id",
        sortOrder = "desc",
        deleted = "without",
    } = params;

    const url = buildQueryParams(`${API_URL}/departments`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });

    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Department>(response, page, perPage);
}

export async function getDepartment(id: number): Promise<Department> {
    const data = await fetchWithAuth(`${API_URL}/departments/${id}`);
    return data.data || data;
}

export async function createDepartment(
    departmentData: CreateDepartmentData,
): Promise<ApiResponse<Department>> {
    return fetchWithAuth(`${API_URL}/departments`, {
        method: "POST",
        body: JSON.stringify(departmentData),
    });
}

export async function updateDepartment(
    id: number,
    departmentData: UpdateDepartmentData,
): Promise<ApiResponse<Department>> {
    return fetchWithAuth(`${API_URL}/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(departmentData),
    });
}

export async function deleteDepartment(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/departments/${id}`, {
        method: "DELETE",
    });
}


