import { useState, useEffect } from "react";

export interface UseEntityOptions<T> {
    fetchFunction: (id: number) => Promise<T>;
    entityId: number | null;
    enabled?: boolean;
}

export interface UseEntityReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useEntity<T>(options: UseEntityOptions<T>): UseEntityReturn<T> {
    const { fetchFunction, entityId, enabled = true } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadEntity = async () => {
        if (!entityId || !enabled) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const result = await fetchFunction(entityId);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load entity");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEntity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityId, enabled]);

    return {
        data,
        isLoading,
        error,
        refetch: loadEntity,
    };
}
