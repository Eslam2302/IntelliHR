import type { PaginatedResponse } from "./api";

export interface AssetAssignment {
    id: number;
    asset_id?: number | null;
    asset?: {
        id: number;
        name: string;
        serial_number: string;
        status?: string | null;
    } | null;
    employee_id?: number | null;
    employee?: {
        id: number;
        name: string;
        email?: string | null;
        phone?: string | null;
    } | null;
    assigned_date?: string | null;
    return_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type AssetAssignmentListResponse = PaginatedResponse<AssetAssignment>;
