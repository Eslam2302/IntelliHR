"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrainingEvaluation, updateTrainingEvaluation } from "@/services/api/training-evaluations";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { TrainingEvaluation } from "@/lib/types/training-evaluation";
import type { UpdateTrainingEvaluationData } from "@/services/api/training-evaluations";

const RATING_OPTIONS = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
];

export default function EditTrainingEvaluationPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: evaluation, isLoading } = useEntity<TrainingEvaluation>({
        fetchFunction: getTrainingEvaluation,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<TrainingEvaluation, UpdateTrainingEvaluationData, UpdateTrainingEvaluationData>({
        initialData: {
            rating: 5,
            feedback: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateTrainingEvaluation(entityId, {
                rating: data.rating != null ? Number(data.rating) : undefined,
                feedback: data.feedback?.trim() || null,
            });
            return res as unknown as { data: TrainingEvaluation };
        },
        onSuccess: () => router.push(`/dashboard/training-evaluations/${id}`),
        validate: (data) => {
            if (data.rating != null && data.rating !== "") {
                const r = Number(data.rating);
                if (isNaN(r) || r < 1 || r > 5) return "Rating must be between 1 and 5";
            }
            return null;
        },
    });

    useEffect(() => {
        if (evaluation) {
            setFormData({
                rating: evaluation.rating ?? 5,
                feedback: evaluation.feedback ?? "",
            });
        }
    }, [evaluation, setFormData]);

    if (isLoading && !evaluation) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!evaluation) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.TRAINING_EVALUATIONS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit evaluation</h1>
                    <p className="text-gray-600 mt-1">
                        {evaluation.employee?.name ?? `Employee #${evaluation.employee_id}`} – {evaluation.training?.title ?? `Session #${evaluation.training_id}`}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Rating (1–5)"
                        name="rating"
                        type="select"
                        value={formData.rating ?? ""}
                        onChange={(e) => updateField("rating", e.target.value)}
                        options={RATING_OPTIONS}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Feedback"
                        name="feedback"
                        type="textarea"
                        value={formData.feedback ?? ""}
                        onChange={(e) => updateField("feedback", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <ActionButtons submitLabel="Update evaluation" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
