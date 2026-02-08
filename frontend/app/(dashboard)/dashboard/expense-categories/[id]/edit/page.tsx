"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExpenseCategory, updateExpenseCategory } from "@/services/api/expense-categories";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { ExpenseCategory } from "@/lib/types/expense-category";
import type { UpdateExpenseCategoryData } from "@/services/api/expense-categories";

export default function EditExpenseCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const { data: category, isLoading } = useEntity<ExpenseCategory>({
        fetchFunction: getExpenseCategory,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<ExpenseCategory, UpdateExpenseCategoryData, UpdateExpenseCategoryData>({
        initialData: {
            name: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateExpenseCategory(entityId, {
                name: data.name?.trim(),
            });
            return res as unknown as { data: ExpenseCategory };
        },
        onSuccess: () => router.push(`/dashboard/expense-categories/${id}`),
        validate: (data) => {
            if (data.name && !data.name.trim()) return "Name is required";
            return null;
        },
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name ?? "",
            });
        }
    }, [category, setFormData]);

    if (isLoading && !category) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!category) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.EXPENSE_CATEGORIES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit expense category</h1>
                    <p className="text-gray-600 mt-1">{category.name}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Name"
                        name="name"
                        type="text"
                        value={formData.name ?? ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Update category" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
