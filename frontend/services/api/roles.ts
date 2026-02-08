import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Role, RoleListResponse } from "@/lib/types/role";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateRoleData {
  name: string;
  permissions?: string[];
}

export interface UpdateRoleData {
  name?: string;
  permissions?: string[];
}

export interface GetRolesParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  deleted?: "without" | "only" | "with";
}

export async function getRoles(params: GetRolesParams = {}): Promise<RoleListResponse> {
  const {
    page = 1,
    perPage = 10,
    search,
    sortBy = "id",
    sortOrder = "desc",
    deleted = "without",
  } = params;
  const url = buildQueryParams(`${API_URL}/roles`, {
    page,
    perPage,
    search,
    sortBy,
    sortOrder,
    deleted,
  });
  const response = await fetchWithAuth(url);
  return transformLaravelResponse<Role>(response, page, perPage);
}

export async function getRole(id: number): Promise<Role> {
  const data = await fetchWithAuth(`${API_URL}/roles/${id}`);
  return data.data ?? data;
}

export async function createRole(payload: CreateRoleData): Promise<ApiResponse<Role>> {
  return fetchWithAuth(`${API_URL}/roles`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRole(id: number, payload: UpdateRoleData): Promise<ApiResponse<Role>> {
  return fetchWithAuth(`${API_URL}/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteRole(id: number): Promise<void> {
  await fetchWithAuth(`${API_URL}/roles/${id}`, { method: "DELETE" });
}
