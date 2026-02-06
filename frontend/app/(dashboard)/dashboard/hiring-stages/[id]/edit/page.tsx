"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHiringStage, updateHiringStage } from "@/services/api/hiring-stages";
import { getJobPosts } from "@/services/api/job-posts";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { HiringStage } from "@/lib/types/hiring-stage";
import type { UpdateHiringStageData } from "@/services/api/hiring-stages";
import type { JobPost } from "@/lib/types/job-post";

export default function EditHiringStagePage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getJobPosts({ perPage: 500, sortBy: "title", sortOrder: "asc" })
            .then((r) => setJobPosts(r.data))
            .catch(() => setJobPosts([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: stage, isLoading } = useEntity<HiringStage>({
        fetchFunction: getHiringStage,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<HiringStage, UpdateHiringStageData, UpdateHiringStageData>({
        initialData: {
            job_id: undefined as unknown as number,
            stage_name: "",
            order: 1,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateHiringStage(entityId, {
                job_id: data.job_id ? Number(data.job_id) : undefined,
                stage_name: data.stage_name?.trim(),
                order: data.order ? Number(data.order) : undefined,
            });
            return res as unknown as { data: HiringStage };
        },
        onSuccess: () => router.push(`/dashboard/hiring-stages/${id}`),
        validate: (data) => {
            if (data.order) {
                const order = Number(data.order);
                if (isNaN(order) || order < 1) return "Order must be a positive number";
            }
            return null;
        },
    });

    useEffect(() => {
        if (stage) {
            setFormData({
                job_id: stage.job_id ?? undefined,
                stage_name: stage.stage_name ?? "",
                order: stage.order ?? 1,
            });
        }
    }, [stage, setFormData]);

    if (isLoading && !stage) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!stage) return null;

    const jobPostOptions = jobPosts.map((jp) => ({ value: jp.id, label: jp.title }));

    return (
        <ProtectedPage permission={PERMISSIONS.HIRING_STAGES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit hiring stage</h1>
                    <p className="text-gray-600 mt-1">{stage.stage_name}</p>
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
                    <ActionButtons submitLabel="Update stage" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
