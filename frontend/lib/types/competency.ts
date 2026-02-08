import type { PaginatedResponse } from "./api";

export interface Competency {
    id: number;
    name: string;
    description?: string | null;
    category?: string | null;
    applicable_to?: string | null;
    rating_descriptors?: Record<number, string> | Array<{ rating: number; descriptor: string }> | null;
    weight?: number | null;
    is_active?: boolean;
    display_order?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type CompetencyListResponse = PaginatedResponse<Competency>;
