"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobPost, updateJobPost } from "@/services/api/job-posts";
import { getDepartments } from "@/services/api/departments";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { JobPost } from "@/lib/types/job-post";
import type { UpdateJobPostData } from "@/services/api/job-posts";
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

export default function EditJobPostPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getDepartments({ perPage: 500, sortBy: "name", sortOrder: "asc" })
            .then((r) => setDepartments(r.data))
            .catch(() => setDepartments([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: jobPost, isLoading } = useEntity<JobPost>({
        fetchFunction: getJobPost,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<JobPost, UpdateJobPostData, UpdateJobPostData>({
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
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateJobPost(entityId, {
                title: data.title?.trim(),
                description: data.description?.trim() || null,
                requirements: data.requirements?.trim() || null,
                responsibilities: data.responsibilities?.trim() || null,
                department_id: data.department_id ? Number(data.department_id) : null,
                job_type: data.job_type || null,
                status: data.status || null,
                posted_at: data.posted_at?.trim() || null,
                linkedin_job_id: data.linkedin_job_id?.trim() || null,
            });
            return res as unknown as { data: JobPost };
        },
        onSuccess: () => router.push(`/dashboard/job-posts/${id}`),
        validate: (data) => {
            if (data.title && !data.title.trim()) return "Title is required";
            return null;
        },
    });

    useEffect(() => {
        if (jobPost) {
            setFormData({
                title: jobPost.title ?? "",
                description: jobPost.description ?? "",
                requirements: jobPost.requirements ?? "",
                responsibilities: jobPost.responsibilities ?? "",
                department_id: jobPost.department_id ?? undefined,
                job_type: jobPost.job_type ?? "external",
                status: jobPost.status ?? "open",
                posted_at: jobPost.posted_at ? new Date(jobPost.posted_at).toISOString().slice(0, 16) : "",
                linkedin_job_id: jobPost.linkedin_job_id ?? "",
            });
        }
    }, [jobPost, setFormData]);

    if (isLoading && !jobPost) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!jobPost) return null;

    const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.JOB_POSTS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit job post</h1>
                    <p className="text-gray-600 mt-1">{jobPost.title}</p>
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
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Job type"
                            name="job_type"
                            type="select"
                            value={formData.job_type ?? ""}
                            onChange={(e) => updateField("job_type", e.target.value)}
                            options={JOB_TYPE_OPTIONS}
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
                    <ActionButtons submitLabel="Update job post" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
