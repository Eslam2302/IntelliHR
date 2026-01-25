import { useState, useEffect, useCallback } from "react";
import type { PaginatedResponse } from "@/lib/types/api";

export interface UseEntityListParams<T> {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
    [key: string]: any;
}

export interface UseEntityListOptions<T> {
    fetchFunction: (params: UseEntityListParams<T>) => Promise<PaginatedResponse<T>>;
    initialParams?: Partial<UseEntityListParams<T>>;
    debounceDelay?: number;
    onFilterChange?: (filter: any) => void;
}

export interface UseEntityListReturn<T> {
    data: T[];
    isLoading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
    searchQuery: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
    deletedFilter: "without" | "only" | "with";
    setCurrentPage: (page: number) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (field: string) => void;
    setSortOrder: (order: "asc" | "desc") => void;
    setDeletedFilter: (filter: "without" | "only" | "with") => void;
    handleSort: (field: string) => void;
    refetch: () => Promise<void>;
}

export function useEntityList<T>(
    options: UseEntityListOptions<T>
): UseEntityListReturn<T> {
    const {
        fetchFunction,
        initialParams = {},
        debounceDelay = 500,
        onFilterChange,
    } = options;

    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialParams.page || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage] = useState(initialParams.perPage || 5);
    const [searchQuery, setSearchQuery] = useState(initialParams.search || "");
    const [sortBy, setSortBy] = useState<string>(initialParams.sortBy || "id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        initialParams.sortOrder || "desc"
    );
    const [deletedFilter, setDeletedFilter] = useState<"without" | "only" | "with">(
        initialParams.deleted || "without"
    );


    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(deletedFilter);
        }
        setCurrentPage(1);
    }, [deletedFilter, onFilterChange]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params: UseEntityListParams<T> = {
                // Start with initial params (static defaults)
                ...initialParams,
                // Then override with current state so UI always wins
                page: currentPage,
                perPage,
                sortBy,
                sortOrder,
                deleted: deletedFilter,
            };

            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const response = await fetchFunction(params);
            setData(response.data || []);

            const totalItems = response.total || 0;
            const calculatedTotalPages = response.last_page
                ? response.last_page
                : totalItems > 0
                    ? Math.ceil(totalItems / perPage)
                    : 1;

            setTotalPages(calculatedTotalPages);
            setTotal(totalItems);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, sortBy, sortOrder, perPage, deletedFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    }, [sortBy]);

    return {
        data,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        perPage,
        searchQuery,
        sortBy,
        sortOrder,
        deletedFilter,
        setCurrentPage,
        setSearchQuery,
        setSortBy,
        setSortOrder,
        setDeletedFilter,
        handleSort,
        refetch: loadData,
    };
}
