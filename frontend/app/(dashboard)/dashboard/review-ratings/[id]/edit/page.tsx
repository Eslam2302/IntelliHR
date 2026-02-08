"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviewRating, updateReviewRating } from "@/services/api/review-ratings";
import { getPerformanceReviews } from "@/services/api/performance-reviews";
import { getCompetencies } from "@/services/api/competencies";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { ReviewRating } from "@/lib/types/review-rating";
import type { UpdateReviewRatingData } from "@/services/api/review-ratings";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { Competency } from "@/lib/types/competency";

function getPerformanceReviewLabel(pr: PerformanceReview): string {
    const employeeName = pr.employee 
        ? getEmployeeDisplayLabel(pr.employee, pr.employee.id)
        : `Employee #${pr.employee_id || '?'}`;
    const cycleName = pr.evaluation_cycle?.name || `Cycle #${pr.evaluation_cycle_id || '?'}`;
    return `${employeeName} - ${cycleName} (Review #${pr.id})`;
}

export default function EditReviewRatingPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getPerformanceReviews({ perPage: 500, sortBy: "created_at", sortOrder: "desc" }),
            getCompetencies({ perPage: 500, sortBy: "name", sortOrder: "asc" }),
        ])
            .then(([reviewsRes, competenciesRes]) => {
                setPerformanceReviews(reviewsRes.data);
                setCompetencies(competenciesRes.data);
            })
            .catch(() => {
                setPerformanceReviews([]);
                setCompetencies([]);
            })
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: reviewRating, isLoading } = useEntity<ReviewRating>({
        fetchFunction: getReviewRating,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<ReviewRating, UpdateReviewRatingData, UpdateReviewRatingData>({
        initialData: {
            performance_review_id: undefined as unknown as number,
            competency_id: undefined as unknown as number,
            self_rating: null,
            self_rating_comment: "",
            manager_rating: null,
            manager_rating_comment: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateReviewRating(entityId, {
                performance_review_id: data.performance_review_id ? Number(data.performance_review_id) : undefined,
                competency_id: data.competency_id ? Number(data.competency_id) : undefined,
                self_rating: data.self_rating ? Number(data.self_rating) : null,
                self_rating_comment: data.self_rating_comment?.trim() || null,
                manager_rating: data.manager_rating ? Number(data.manager_rating) : null,
                manager_rating_comment: data.manager_rating_comment?.trim() || null,
            });
            return res as unknown as { data: ReviewRating };
        },
        onSuccess: () => router.push(`/dashboard/review-ratings/${id}`),
        validate: (data) => {
            return null;
        },
    });

    useEffect(() => {
        if (reviewRating) {
            setFormData({
                performance_review_id: reviewRating.performance_review_id ?? undefined,
                competency_id: reviewRating.competency_id ?? undefined,
                self_rating: reviewRating.self_rating ?? null,
                self_rating_comment: reviewRating.self_rating_comment ?? "",
                manager_rating: reviewRating.manager_rating ?? null,
                manager_rating_comment: reviewRating.manager_rating_comment ?? "",
            });
        }
    }, [reviewRating, setFormData]);

    if (isLoading && !reviewRating) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!reviewRating) return null;

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const performanceReviewOptions = performanceReviews.map((pr) => ({ value: pr.id, label: getPerformanceReviewLabel(pr) }));
    const competencyOptions = competencies.map((c) => ({ value: c.id, label: c.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.REVIEW_RATINGS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit review rating</h1>
                    <p className="text-gray-600 mt-1">Review Rating #{reviewRating.id}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Performance Review"
                        name="performance_review_id"
                        type="select"
                        value={formData.performance_review_id ?? ""}
                        onChange={(e) => updateField("performance_review_id", e.target.value)}
                        options={performanceReviewOptions}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Competency"
                        name="competency_id"
                        type="select"
                        value={formData.competency_id ?? ""}
                        onChange={(e) => updateField("competency_id", e.target.value)}
                        options={competencyOptions}
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Self Rating"
                            name="self_rating"
                            type="number"
                            value={formData.self_rating ?? ""}
                            onChange={(e) => updateField("self_rating", e.target.value || null)}
                            disabled={isSubmitting}
                            min={1}
                            max={5}
                        />
                        <FormField
                            label="Manager Rating"
                            name="manager_rating"
                            type="number"
                            value={formData.manager_rating ?? ""}
                            onChange={(e) => updateField("manager_rating", e.target.value || null)}
                            disabled={isSubmitting}
                            min={1}
                            max={5}
                        />
                    </div>
                    <FormField
                        label="Self Rating Comment"
                        name="self_rating_comment"
                        type="textarea"
                        value={formData.self_rating_comment ?? ""}
                        onChange={(e) => updateField("self_rating_comment", e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                    />
                    <FormField
                        label="Manager Rating Comment"
                        name="manager_rating_comment"
                        type="textarea"
                        value={formData.manager_rating_comment ?? ""}
                        onChange={(e) => updateField("manager_rating_comment", e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                    />
                    <ActionButtons submitLabel="Update review rating" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
