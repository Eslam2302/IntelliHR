"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrainingSession } from "@/services/api/training-sessions";
import { getTrainers } from "@/services/api/trainers";
import { getDepartments } from "@/services/api/departments";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { TrainingSession } from "@/lib/types/training-session";
import type { CreateTrainingSessionData } from "@/services/api/training-sessions";
import type { Trainer } from "@/lib/types/trainer";
import type { Department } from "@/lib/types/department";

function trainerLabel(t: Trainer): string {
    if (t.type === "internal" && t.employee) return t.employee.name ?? `Trainer #${t.id}`;
    return t.name ?? `Trainer #${t.id}`;
}

export default function NewTrainingSessionPage() {
    const router = useRouter();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getTrainers({ perPage: 500, sortBy: "id", sortOrder: "asc" }),
            getDepartments({ perPage: 500, sortBy: "name", sortOrder: "asc" }),
        ])
            .then(([tr, dept]) => {
                setTrainers(tr.data);
                setDepartments(dept.data);
            })
            .catch(() => {})
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<TrainingSession, CreateTrainingSessionData, CreateTrainingSessionData>({
        initialData: {
            title: "",
            start_date: "",
            end_date: "",
            trainer_id: undefined as unknown as number,
            department_id: undefined as unknown as number,
            description: "",
        },
        createFunction: async (data) => {
            const res = await createTrainingSession({
                title: data.title!,
                start_date: data.start_date!,
                end_date: data.end_date!,
                trainer_id: data.trainer_id ? Number(data.trainer_id) : null,
                department_id: data.department_id ? Number(data.department_id) : null,
                description: data.description?.trim() || null,
            });
            return res as unknown as { data: TrainingSession };
        },
        onSuccess: () => router.push("/dashboard/training-sessions"),
        validate: (data) => {
            if (!data.title?.trim()) return "Title is required";
            if (!data.start_date?.trim()) return "Start date is required";
            if (!data.end_date?.trim()) return "End date is required";
            if (data.start_date && data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
                return "End date must be after start date";
            }
            return null;
        },
    });

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const trainerOptions = trainers
        .filter((t) => t.id != null)
        .map((t) => ({ value: t.id as number, label: trainerLabel(t) }));
    const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.TRAINING_SESSIONS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create training session</h1>
                    <p className="text-gray-600 mt-1">Add a new training session</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title ?? ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Start date"
                            name="start_date"
                            type="date"
                            value={formData.start_date ?? ""}
                            onChange={(e) => updateField("start_date", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="End date"
                            name="end_date"
                            type="date"
                            value={formData.end_date ?? ""}
                            onChange={(e) => updateField("end_date", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Trainer"
                        name="trainer_id"
                        type="select"
                        value={formData.trainer_id ?? ""}
                        onChange={(e) => updateField("trainer_id", e.target.value)}
                        options={trainerOptions}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Department"
                        name="department_id"
                        type="select"
                        value={formData.department_id ?? ""}
                        onChange={(e) => updateField("department_id", e.target.value)}
                        options={departmentOptions}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description ?? ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <ActionButtons submitLabel="Create session" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
