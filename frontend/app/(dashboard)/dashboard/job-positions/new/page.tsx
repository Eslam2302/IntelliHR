"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createJobPosition } from "@/services/api/job-positions";
import { getDepartments } from "@/services/api/departments";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { JobPosition } from "@/services/api/job-positions";
import type { CreateJobPositionData } from "@/services/api/job-positions";
import type { Department } from "@/lib/types/department";

export default function NewJobPositionPage() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getDepartments({ perPage: 500, sortBy: "name", sortOrder: "asc" })
            .then((r) => setDepartments(r.data))
            .catch(() => setDepartments([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<JobPosition, CreateJobPositionData, CreateJobPositionData>({
        initialData: {
            title: "",
            grade: "",
            department_id: undefined as unknown as number,
            min_salary: undefined as unknown as number,
            max_salary: undefined as unknown as number,
            responsibilities: "",
        },
        createFunction: async (data) => {
            return createJobPosition({
                title: data.title!.trim(),
                grade: data.grade!.trim(),
                department_id: Number(data.department_id)!,
                min_salary: Number(data.min_salary)!,
                max_salary: Number(data.max_salary)!,
                responsibilities: data.responsibilities?.trim() || undefined,
            });
        },
        onSuccess: () => router.push("/dashboard/job-positions"),
        validate: (data) => {
            if (!data.title?.trim()) return "Title is required";
            if (!data.grade?.trim()) return "Grade is required";
            if (!data.department_id) return "Department is required";
            if (data.min_salary == null || data.min_salary === "") return "Min salary is required";
            if (data.max_salary == null || data.max_salary === "") return "Max salary is required";
            const min = Number(data.min_salary);
            const max = Number(data.max_salary);
            if (isNaN(min) || min < 0) return "Min salary must be a valid number";
            if (isNaN(max) || max < 0) return "Max salary must be a valid number";
            if (max < min) return "Max salary must be ≥ min salary";
            return null;
        },
    });

    if (loadingOptions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading form...</div>
            </div>
        );
    }

    const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.JOB_POSITIONS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create job position</h1>
                    <p className="text-gray-600 mt-1">Add a new job position</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title ?? ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="e.g. Software Engineer"
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Grade"
                        name="grade"
                        type="text"
                        value={formData.grade ?? ""}
                        onChange={(e) => updateField("grade", e.target.value)}
                        placeholder="e.g. 10"
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Department"
                        name="department_id"
                        type="select"
                        value={formData.department_id ?? ""}
                        onChange={(e) => updateField("department_id", e.target.value)}
                        options={departmentOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Min salary"
                            name="min_salary"
                            type="number"
                            value={formData.min_salary ?? ""}
                            onChange={(e) => updateField("min_salary", e.target.value)}
                            placeholder="0"
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Max salary"
                            name="max_salary"
                            type="number"
                            value={formData.max_salary ?? ""}
                            onChange={(e) => updateField("max_salary", e.target.value)}
                            placeholder="0"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Responsibilities"
                        name="responsibilities"
                        type="textarea"
                        value={formData.responsibilities ?? ""}
                        onChange={(e) => updateField("responsibilities", e.target.value)}
                        placeholder="Optional"
                        disabled={isSubmitting}
                        rows={3}
                    />
                    <ActionButtons submitLabel="Create job position" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
