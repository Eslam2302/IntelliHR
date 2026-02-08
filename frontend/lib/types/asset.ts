import type { PaginatedResponse } from "./api";

export interface Asset {
    id: number;
    name: string;
    serial_number: string;
    condition?: string | null;
    status?: string | null;
    current_assignment?: {
        employee_id: number;
        employee?: {
            id: number;
            first_name?: string;
            last_name?: string;
            name?: string;
        } | null;
        assigned_date?: string | null;
        return_date?: string | null;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export type AssetListResponse = PaginatedResponse<Asset>;
