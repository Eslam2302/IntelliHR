"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApplicant, updateApplicant } from "@/services/api/applicants";
import { getJobPosts } from "@/services/api/job-posts";
import { getHiringStages } from "@/services/api/hiring-stages";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Applicant } from "@/lib/types/applicant";
import type { UpdateApplicantData } from "@/services/api/applicants";
import type { JobPost } from "@/lib/types/job-post";
import type { HiringStage } from "@/lib/types/hiring-stage";

const STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interviewed", label: "Interviewed" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
];

const SOURCE_OPTIONS = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "website", label: "Website" },
    { value: "referral", label: "Referral" },
    { value: "other", label: "Other" },
];

export default function EditApplicantPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [hiringStages, setHiringStages] = useState<HiringStage[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    useEffect(() => {
        Promise.all([
            getJobPosts({ perPage: 500, sortBy: "title", sortOrder: "asc" }),
            getHiringStages({ perPage: 500, sortBy: "order", sortOrder: "asc" }),
        ])
            .then(([jobs, stages]) => {
                setJobPosts(jobs.data);
                setHiringStages(stages.data);
            })
            .catch(() => {})
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: applicant, isLoading } = useEntity<Applicant>({
        fetchFunction: getApplicant,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Applicant, UpdateApplicantData, UpdateApplicantData>({
        initialData: {
            job_id: undefined as unknown as number,
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            is_employee: false,
            status: "applied",
            source: "website",
            experience_years: undefined as unknown as number,
            current_stage_id: undefined as unknown as number,
            resume_path: "",
            applied_at: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateApplicant(entityId, {
                job_id: data.job_id ? Number(data.job_id) : undefined,
                first_name: data.first_name?.trim(),
                last_name: data.last_name?.trim(),
                email: data.email?.trim(),
                phone: data.phone ? data.phone.trim() : undefined,
                is_employee: data.is_employee,
                status: data.status || null,
                source: data.source || null,
                experience_years: data.experience_years ? Number(data.experience_years) : null,
                current_stage_id: data.current_stage_id ? Number(data.current_stage_id) : null,
                // Allow either uploading a new resume file or updating the path
                resume: resumeFile ?? undefined,
                resume_path: data.resume_path ? data.resume_path.trim() : undefined,
                applied_at: data.applied_at?.trim() || null,
            });
            return res as unknown as { data: Applicant };
        },
        onSuccess: () => router.push(`/dashboard/applicants/${id}`),
        validate: (data) => {
            if (data.first_name && !data.first_name.trim()) return "First name is required";
            if (data.last_name && !data.last_name.trim()) return "Last name is required";
            if (data.email && !data.email.trim()) return "Email is required";
            return null;
        },
    });

    useEffect(() => {
        if (applicant) {
            setFormData({
                job_id: applicant.job_id ?? undefined,
                first_name: applicant.first_name ?? "",
                last_name: applicant.last_name ?? "",
                email: applicant.email ?? "",
                phone: applicant.phone ?? "",
                is_employee: applicant.is_employee || false,
                status: applicant.status ?? "new",
                source: applicant.source ?? "website",
                experience_years: applicant.experience_years ?? undefined,
                current_stage_id: applicant.current_stage_id ?? undefined,
                resume_path: applicant.resume_path ?? "",
                applied_at: applicant.applied_at ? new Date(applicant.applied_at).toISOString().slice(0, 16) : "",
            });
        }
    }, [applicant, setFormData]);

    if (isLoading && !applicant) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!applicant) return null;

    const jobPostOptions = jobPosts.map((jp) => ({ value: jp.id, label: jp.title }));
    const stageOptions = hiringStages.map((hs) => ({ value: hs.id, label: hs.stage_name }));

    return (
        <ProtectedPage permission={PERMISSIONS.APPLICANTS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit applicant</h1>
                    <p className="text-gray-600 mt-1">{applicant.first_name} {applicant.last_name}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Job post"
                        name="job_id"
                        type="select"
                        value={formData.job_id ?? ""}
                        onChange={(e) => updateField("job_id", e.target.value)}
                        options={jobPostOptions}
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="First name"
                            name="first_name"
                            type="text"
                            value={formData.first_name ?? ""}
                            onChange={(e) => updateField("first_name", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Last name"
                            name="last_name"
                            type="text"
                            value={formData.last_name ?? ""}
                            onChange={(e) => updateField("last_name", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email ?? ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Phone"
                        name="phone"
                        type="tel"
                        value={formData.phone ?? ""}
                        onChange={(e) => updateField("phone", e.target.value)}
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            label="Source"
                            name="source"
                            type="select"
                            value={formData.source ?? ""}
                            onChange={(e) => updateField("source", e.target.value)}
                            options={SOURCE_OPTIONS}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Experience (years)"
                            name="experience_years"
                            type="number"
                            value={formData.experience_years ?? ""}
                            onChange={(e) => updateField("experience_years", e.target.value)}
                            disabled={isSubmitting}
                            min={0}
                        />
                        <FormField
                            label="Current stage"
                            name="current_stage_id"
                            type="select"
                            value={formData.current_stage_id ?? ""}
                            onChange={(e) => updateField("current_stage_id", e.target.value)}
                            options={stageOptions}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                                Replace resume file
                            </label>
                            <input
                                id="resume"
                                name="resume"
                                type="file"
                                accept=".pdf"
                                disabled={isSubmitting}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setResumeFile(file);
                                }}
                                className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Leave empty to keep the existing resume. Uploading a new file will overwrite it.
                            </p>
                        </div>
                        <FormField
                            label="Resume path"
                            name="resume_path"
                            type="text"
                            value={formData.resume_path ?? ""}
                            onChange={(e) => updateField("resume_path", e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Path to resume file"
                        />
                        <FormField
                            label="Applied at"
                            name="applied_at"
                            type="datetime-local"
                            value={formData.applied_at ?? ""}
                            onChange={(e) => updateField("applied_at", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_employee"
                            checked={formData.is_employee || false}
                            onChange={(e) => updateField("is_employee", e.target.checked)}
                            disabled={isSubmitting}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_employee" className="ml-2 block text-sm text-gray-900">
                            Is employee
                        </label>
                    </div>
                    <ActionButtons submitLabel="Update applicant" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
