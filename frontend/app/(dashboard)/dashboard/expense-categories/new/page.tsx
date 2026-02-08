"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpenseCategory } from "@/services/api/expense-categories";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { ExpenseCategory } from "@/lib/types/expense-category";
import type { CreateExpenseCategoryData } from "@/services/api/expense-categories";

export default function NewExpenseCategoryPage() {
    const router = useRouter();

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<ExpenseCategory, CreateExpenseCategoryData, CreateExpenseCategoryData>({
        initialData: {
            name: "",
        },
        createFunction: async (data) => {
            const res = await createExpenseCategory({
                name: data.name!,
            });
            return res as unknown as { data: ExpenseCategory };
        },
        onSuccess: () => router.push("/dashboard/expense-categories"),
        validate: (data) => {
            if (!data.name?.trim()) return "Name is required";
            return null;
        },
    });

    return (
        <ProtectedPage permission={PERMISSIONS.EXPENSE_CATEGORIES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create expense category</h1>
                    <p className="text-gray-600 mt-1">Add a new expense category</p>
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
                    <ActionButtons submitLabel="Create category" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
