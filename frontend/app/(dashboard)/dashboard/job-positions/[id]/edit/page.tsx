"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getJobPosition, updateJobPosition } from "@/services/api/job-positions";
import { getDepartments } from "@/services/api/departments";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { JobPosition } from "@/services/api/job-positions";
import type { UpdateJobPositionData } from "@/services/api/job-positions";
import type { Department } from "@/lib/types/department";

export default function EditJobPositionPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const { data: job, isLoading } = useEntity<JobPosition>({ fetchFunction: getJobPosition, entityId: id });

    useEffect(() => {
        getDepartments({ perPage: 500, sortBy: "name", sortOrder: "asc" })
            .then((r) => setDepartments(r.data))
            .catch(() => setDepartments([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
        setError,
    } = useEntityForm<JobPosition, never, UpdateJobPositionData>({
        initialData: {
            title: "",
            grade: "",
            department_id: undefined,
            min_salary: undefined,
            max_salary: undefined,
            responsibilities: "",
        },
        updateFunction: async (jobId, data) => {
            return updateJobPosition(jobId, {
                title: data.title?.trim(),
                grade: data.grade?.trim(),
                department_id: data.department_id != null ? Number(data.department_id) : undefined,
                min_salary: data.min_salary != null ? Number(data.min_salary) : undefined,
                max_salary: data.max_salary != null ? Number(data.max_salary) : undefined,
                responsibilities: data.responsibilities?.trim() || undefined,
            });
        },
        entityId: id,
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

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title ?? "",
                grade: job.grade ?? "",
                department_id: job.department_id ?? undefined,
                min_salary: job.min_salary ?? undefined,
                max_salary: job.max_salary ?? undefined,
                responsibilities: job.responsibilities ?? "",
            });
        }
    }, [job, setFormData]);

    useEffect(() => {
        if (job && !isLoading) setError(null);
    }, [job, isLoading, setError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading job position...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Job position not found</div>
            </div>
        );
    }

    if (loadingOptions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading form...</div>
            </div>
        );
    }

    const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.JOB_POSITIONS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit job position</h1>
                    <p className="text-gray-600 mt-1">{job.title}</p>
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
                    <ActionButtons submitLabel="Update job position" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
