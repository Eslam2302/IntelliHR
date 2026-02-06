"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployeeTraining, updateEmployeeTraining } from "@/services/api/employee-trainings";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { EmployeeTraining } from "@/lib/types/employee-training";
import type { UpdateEmployeeTrainingData } from "@/services/api/employee-trainings";

const STATUS_OPTIONS = [
    { value: "enrolled", label: "Enrolled" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function EditEmployeeTrainingPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: record, isLoading } = useEntity<EmployeeTraining>({
        fetchFunction: getEmployeeTraining,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<EmployeeTraining, UpdateEmployeeTrainingData, UpdateEmployeeTrainingData>({
        initialData: {
            status: "enrolled",
            completion_date: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateEmployeeTraining(entityId, {
                status: data.status?.trim(),
                completion_date: data.completion_date?.trim() || null,
            });
            return res as unknown as { data: EmployeeTraining };
        },
        onSuccess: () => router.push(`/dashboard/employee-trainings/${id}`),
        validate: () => null,
    });

    useEffect(() => {
        if (record) {
            setFormData({
                status: record.status ?? "enrolled",
                completion_date: record.completion_date ?? "",
            });
        }
    }, [record, setFormData]);

    if (isLoading && !record) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!record) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.EMPLOYEE_TRAININGS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit employee training</h1>
                    <p className="text-gray-600 mt-1">
                        {record.employee?.name ?? `Employee #${record.employee_id}`} – {record.training_session?.title ?? `Session #${record.training_id}`}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Employee"
                        name="employee_id"
                        type="text"
                        value={record.employee?.name ?? `Employee #${record.employee_id}`}
                        onChange={() => {}}
                        disabled
                    />
                    <FormField
                        label="Training session"
                        name="training_id"
                        type="text"
                        value={record.training_session?.title ?? `Session #${record.training_id}`}
                        onChange={() => {}}
                        disabled
                    />
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? ""}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Completion date"
                        name="completion_date"
                        type="date"
                        value={formData.completion_date ?? ""}
                        onChange={(e) => updateField("completion_date", e.target.value)}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Update" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
