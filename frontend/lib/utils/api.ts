import { getToken } from "@/services/api/auth";
import type { PaginatedResponse } from "@/lib/types/api";

/**
 * Fetch with authentication
 * Wraps fetch with Bearer token authentication
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getToken();

    if (!token) {
        throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

/**
 * Transform Laravel pagination response to PaginatedResponse format
 * Laravel returns: { data: [...], meta: { current_page, per_page, total, last_page } }
 * We transform to: { data: [...], current_page, per_page, total, last_page }
 */
export function transformLaravelResponse<T>(
    response: any,
    defaultPage: number = 1,
    defaultPerPage: number = 5,
): PaginatedResponse<T> {
    if (response.meta) {
        return {
            data: response.data || [],
            current_page: response.meta.current_page || defaultPage,
            per_page: response.meta.per_page || defaultPerPage,
            total: response.meta.total || 0,
            last_page: response.meta.last_page || 1,
        };
    }

    return response;
}

/**
 * Build query parameters for list endpoints
 * Handles pagination, search, sorting, and filters
 */
export interface BuildQueryParamsOptions {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
    [key: string]: any;
}

export function buildQueryParams(
    baseUrl: string,
    options: BuildQueryParamsOptions = {},
): string {
    const {
        page = 1,
        perPage = 5,
        search,
        sortBy,
        sortOrder,
        deleted,
        ...otherParams
    } = options;

    const url = new URL(baseUrl);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", perPage.toString());

    if (search) {
        url.searchParams.set("search", search);
    }

    if (sortBy) {
        url.searchParams.set("sort", sortBy);
        url.searchParams.set("direction", sortOrder || "asc");
    }

    if (deleted) {
        url.searchParams.set("deleted", deleted);
    }

    Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });

    return url.toString();
}
