import { useState, FormEvent } from "react";
import type { ApiResponse } from "@/lib/types/api";

export interface UseEntityFormOptions<T, CreateT, UpdateT> {
    initialData?: Partial<T>;
    createFunction?: (data: CreateT) => Promise<ApiResponse<T>>;
    updateFunction?: (id: number, data: UpdateT) => Promise<ApiResponse<T>>;
    entityId?: number;
    onSuccess?: () => void;
    validate?: (data: any) => string | null;
}

export interface UseEntityFormReturn<T> {
    formData: Partial<T>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<T>>>;
    updateField: (field: keyof T, value: any) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    reset: () => void;
}

export function useEntityForm<T extends Record<string, any>, CreateT, UpdateT>(
    options: UseEntityFormOptions<T, CreateT, UpdateT>
): UseEntityFormReturn<T> {
    const {
        initialData = {},
        createFunction,
        updateFunction,
        entityId,
        onSuccess,
        validate,
    } = options;

    const [formData, setFormData] = useState<Partial<T>>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading] = useState(false);

    const updateField = (field: keyof T, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (validate) {
            const validationError = validate(formData);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        try {
            setIsSubmitting(true);

            if (entityId && updateFunction) {
                await updateFunction(entityId, formData as UpdateT);
            } else if (createFunction) {
                await createFunction(formData as CreateT);
            } else {
                throw new Error("No create or update function provided");
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setFormData(initialData);
        setError(null);
    };

    return {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isLoading,
        isSubmitting,
        error,
        setError,
        reset,
    };
}
