"use client";

import { useRouter } from "next/navigation";
import { createDepartment } from "@/services/api/departments";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Department } from "@/lib/types/department";
import type { CreateDepartmentData } from "@/services/api/departments";

export default function NewDepartmentPage() {
    const router = useRouter();

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Department, CreateDepartmentData, CreateDepartmentData>({
        initialData: {
            name: "",
            description: "",
        },
        createFunction: async (data) => {
            return createDepartment({
                name: data.name?.trim() || "",
                description: data.description?.trim() || undefined,
            });
        },
        onSuccess: () => {
            router.push("/dashboard/departments");
        },
        validate: (data) => {
            if (!data.name?.trim()) {
                return "Department name is required";
            }
            return null;
        },
    });

    return (
        <ProtectedPage permission={PERMISSIONS.DEPARTMENTS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Department</h1>
                    <p className="text-gray-600 mt-1">Add a new department to your organization</p>
                </div>

                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Department Name"
                        name="name"
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="e.g., Human Resources"
                        required
                        disabled={isSubmitting}
                    />

                    <FormField
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Optional description of the department"
                        disabled={isSubmitting}
                    />

                    <ActionButtons
                        submitLabel="Create Department"
                        isSubmitting={isSubmitting}
                    />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
