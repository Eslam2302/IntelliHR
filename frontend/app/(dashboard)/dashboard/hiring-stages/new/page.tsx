"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createHiringStage } from "@/services/api/hiring-stages";
import { getJobPosts } from "@/services/api/job-posts";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { HiringStage } from "@/lib/types/hiring-stage";
import type { CreateHiringStageData } from "@/services/api/hiring-stages";
import type { JobPost } from "@/lib/types/job-post";

export default function NewHiringStagePage() {
    const router = useRouter();
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getJobPosts({ perPage: 500, sortBy: "title", sortOrder: "asc" })
            .then((r) => setJobPosts(r.data))
            .catch(() => setJobPosts([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<HiringStage, CreateHiringStageData, CreateHiringStageData>({
        initialData: {
            job_id: undefined as unknown as number,
            stage_name: "",
            order: 1,
        },
        createFunction: async (data) => {
            const res = await createHiringStage({
                job_id: Number(data.job_id)!,
                stage_name: data.stage_name!,
                order: Number(data.order)!,
            });
            return res as unknown as { data: HiringStage };
        },
        onSuccess: () => router.push("/dashboard/hiring-stages"),
        validate: (data) => {
            if (!data.job_id) return "Job post is required";
            if (!data.stage_name?.trim()) return "Stage name is required";
            const order = Number(data.order);
            if (isNaN(order) || order < 1) return "Order must be a positive number";
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

    return (
        <ProtectedPage permission={PERMISSIONS.HIRING_STAGES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create hiring stage</h1>
                    <p className="text-gray-600 mt-1">Add a new hiring stage</p>
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
                    <FormField
                        label="Stage name"
                        name="stage_name"
                        type="text"
                        value={formData.stage_name ?? ""}
                        onChange={(e) => updateField("stage_name", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Order"
                        name="order"
                        type="number"
                        value={formData.order ?? ""}
                        onChange={(e) => updateField("order", e.target.value)}
                        required
                        disabled={isSubmitting}
                        min={1}
                    />
                    <ActionButtons submitLabel="Create stage" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
