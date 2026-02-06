"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createApplicant } from "@/services/api/applicants";
import { getJobPosts } from "@/services/api/job-posts";
import { getHiringStages } from "@/services/api/hiring-stages";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Applicant } from "@/lib/types/applicant";
import type { CreateApplicantData } from "@/services/api/applicants";
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

export default function NewApplicantPage() {
    const router = useRouter();
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

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Applicant, CreateApplicantData, CreateApplicantData>({
        initialData: {
            job_id: undefined as unknown as number,
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            is_employee: false,
            status: "new",
            source: "website",
            experience_years: undefined as unknown as number,
            current_stage_id: undefined as unknown as number,
            resume_path: "",
            applied_at: "",
        },
        createFunction: async (data) => {
            const res = await createApplicant({
                job_id: Number(data.job_id)!,
                first_name: data.first_name!,
                last_name: data.last_name!,
                email: data.email!,
                phone: data.phone!.trim(),
                is_employee: data.is_employee || false,
                status: data.status || null,
                source: data.source || null,
                experience_years: data.experience_years ? Number(data.experience_years) : null,
                current_stage_id: data.current_stage_id ? Number(data.current_stage_id) : null,
                // Prefer uploaded file; resume_path is optional advanced override
                resume: resumeFile,
                resume_path: data.resume_path?.trim() || null,
                applied_at: data.applied_at?.trim() || null,
            });
            return res as unknown as { data: Applicant };
        },
        onSuccess: () => router.push("/dashboard/applicants"),
        validate: (data) => {
            if (!data.job_id) return "Job post is required";
            if (!data.first_name?.trim()) return "First name is required";
            if (!data.last_name?.trim()) return "Last name is required";
            if (!data.email?.trim()) return "Email is required";
            if (!data.phone?.trim()) return "Phone is required";
            if (!resumeFile && !data.resume_path?.trim()) return "Resume file or path is required";
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

    const jobPostOptions = jobPosts.map((jp) => ({ value: jp.id, label: jp.title }));
    const stageOptions = hiringStages.map((hs) => ({ value: hs.id, label: hs.stage_name }));

    return (
        <ProtectedPage permission={PERMISSIONS.APPLICANTS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create applicant</h1>
                    <p className="text-gray-600 mt-1">Add a new job applicant</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Job post"
                        name="job_id"
                        type="select"
                        value={formData.job_id ?? ""}
                        onChange={(e) => updateField("job_id", e.target.value)}
                        options={jobPostOptions}
                        required
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
                        required
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
                                Resume file <span className="text-red-500">*</span>
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
                            <p className="mt-1 text-xs text-gray-500">Upload a PDF resume, or provide a server path below.</p>
                        </div>
                        <FormField
                            label="Resume path (optional override)"
                            name="resume_path"
                            type="text"
                            value={formData.resume_path ?? ""}
                            onChange={(e) => updateField("resume_path", e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Only if the file already exists on the server"
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
                    <ActionButtons submitLabel="Create applicant" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
