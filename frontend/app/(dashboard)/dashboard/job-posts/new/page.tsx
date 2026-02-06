"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createJobPost } from "@/services/api/job-posts";
import { getDepartments } from "@/services/api/departments";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { JobPost } from "@/lib/types/job-post";
import type { CreateJobPostData } from "@/services/api/job-posts";
import type { Department } from "@/lib/types/department";

const JOB_TYPE_OPTIONS = [
    { value: "internal", label: "Internal" },
    { value: "external", label: "External" },
    { value: "both", label: "Both" },
];

const STATUS_OPTIONS = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
];

export default function NewJobPostPage() {
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
    } = useEntityForm<JobPost, CreateJobPostData, CreateJobPostData>({
        initialData: {
            title: "",
            description: "",
            requirements: "",
            responsibilities: "",
            department_id: undefined as unknown as number,
            job_type: "external",
            status: "open",
            posted_at: "",
            linkedin_job_id: "",
        },
        createFunction: async (data) => {
            const res = await createJobPost({
                title: data.title!,
                description: data.description!,
                requirements: data.requirements?.trim() || null,
                responsibilities: data.responsibilities?.trim() || null,
                department_id: Number(data.department_id)!,
                job_type: data.job_type!,
                status: data.status!,
                posted_at: data.posted_at?.trim() || null,
                linkedin_job_id: data.linkedin_job_id?.trim() || null,
            });
            return res as unknown as { data: JobPost };
        },
        onSuccess: () => router.push("/dashboard/job-posts"),
        validate: (data) => {
            if (!data.title?.trim()) return "Title is required";
            if (!data.description?.trim()) return "Description is required";
            if (!data.department_id) return "Department is required";
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

    const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.JOB_POSTS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create job post</h1>
                    <p className="text-gray-600 mt-1">Add a new job posting</p>
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
                            label="Department"
                            name="department_id"
                            type="select"
                            value={formData.department_id ?? ""}
                            onChange={(e) => updateField("department_id", e.target.value)}
                            options={departmentOptions}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Job type"
                            name="job_type"
                            type="select"
                            value={formData.job_type ?? ""}
                            onChange={(e) => updateField("job_type", e.target.value)}
                            options={JOB_TYPE_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
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
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description ?? ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        required
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <FormField
                        label="Requirements"
                        name="requirements"
                        type="textarea"
                        value={formData.requirements ?? ""}
                        onChange={(e) => updateField("requirements", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <FormField
                        label="Responsibilities"
                        name="responsibilities"
                        type="textarea"
                        value={formData.responsibilities ?? ""}
                        onChange={(e) => updateField("responsibilities", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Posted at"
                            name="posted_at"
                            type="datetime-local"
                            value={formData.posted_at ?? ""}
                            onChange={(e) => updateField("posted_at", e.target.value)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="LinkedIn Job ID"
                            name="linkedin_job_id"
                            type="text"
                            value={formData.linkedin_job_id ?? ""}
                            onChange={(e) => updateField("linkedin_job_id", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <ActionButtons submitLabel="Create job post" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
