"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createReviewRating } from "@/services/api/review-ratings";
import { getPerformanceReviews } from "@/services/api/performance-reviews";
import { getCompetencies } from "@/services/api/competencies";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { ReviewRating } from "@/lib/types/review-rating";
import type { CreateReviewRatingData } from "@/services/api/review-ratings";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { Competency } from "@/lib/types/competency";

function getPerformanceReviewLabel(pr: PerformanceReview): string {
    const employeeName = pr.employee 
        ? getEmployeeDisplayLabel(pr.employee, pr.employee.id)
        : `Employee #${pr.employee_id || '?'}`;
    const cycleName = pr.evaluation_cycle?.name || `Cycle #${pr.evaluation_cycle_id || '?'}`;
    return `${employeeName} - ${cycleName} (Review #${pr.id})`;
}

export default function NewReviewRatingPage() {
    const router = useRouter();
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

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<ReviewRating, CreateReviewRatingData, CreateReviewRatingData>({
        initialData: {
            performance_review_id: undefined as unknown as number,
            competency_id: undefined as unknown as number,
            self_rating: null,
            self_rating_comment: "",
            manager_rating: null,
            manager_rating_comment: "",
        },
        createFunction: async (data) => {
            const res = await createReviewRating({
                performance_review_id: Number(data.performance_review_id)!,
                competency_id: Number(data.competency_id)!,
                self_rating: data.self_rating ? Number(data.self_rating) : null,
                self_rating_comment: data.self_rating_comment?.trim() || null,
                manager_rating: data.manager_rating ? Number(data.manager_rating) : null,
                manager_rating_comment: data.manager_rating_comment?.trim() || null,
            });
            return res as unknown as { data: ReviewRating };
        },
        onSuccess: () => router.push("/dashboard/review-ratings"),
        validate: (data) => {
            if (!data.performance_review_id) return "Performance review is required";
            if (!data.competency_id) return "Competency is required";
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

    const performanceReviewOptions = performanceReviews.map((pr) => ({ value: pr.id, label: getPerformanceReviewLabel(pr) }));
    const competencyOptions = competencies.map((c) => ({ value: c.id, label: c.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.REVIEW_RATINGS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create review rating</h1>
                    <p className="text-gray-600 mt-1">Add a new review rating</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Performance Review"
                        name="performance_review_id"
                        type="select"
                        value={formData.performance_review_id ?? ""}
                        onChange={(e) => updateField("performance_review_id", e.target.value)}
                        options={performanceReviewOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Competency"
                        name="competency_id"
                        type="select"
                        value={formData.competency_id ?? ""}
                        onChange={(e) => updateField("competency_id", e.target.value)}
                        options={competencyOptions}
                        required
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
                    <ActionButtons submitLabel="Create review rating" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
