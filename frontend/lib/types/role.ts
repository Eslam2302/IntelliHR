import type { PaginatedResponse } from "./api";

export interface RolePermission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions?: RolePermission[];
  permissions_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export type RoleListResponse = PaginatedResponse<Role>;
