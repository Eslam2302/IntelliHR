"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPerformanceReview, acknowledgeReview } from "@/services/api/performance-reviews";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { PageHeader } from "@/components/ui/PageHeader";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { AcknowledgeReviewData } from "@/services/api/performance-reviews";

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function AcknowledgeReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseId(params.id);

    const { data: performanceReview, isLoading, refetch } = useEntity<PerformanceReview>({
        fetchFunction: getPerformanceReview,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<PerformanceReview, AcknowledgeReviewData, AcknowledgeReviewData>({
        initialData: {
            employee_acknowledgment_comments: "",
        },
        createFunction: async (data) => {
            if (!id) throw new Error("Invalid review ID");
            const res = await acknowledgeReview(id, data);
            return res as unknown as { data: PerformanceReview };
        },
        onSuccess: () => {
            refetch();
            router.push(`/dashboard/performance-reviews/${id}`);
        },
        validate: () => {
            return null; // Comments are optional
        },
    });

    useEffect(() => {
        if (performanceReview?.acknowledgment?.comments) {
            setFormData({
                employee_acknowledgment_comments: performanceReview.acknowledgment.comments ?? "",
            });
        }
    }, [performanceReview, setFormData]);

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid performance review ID</p>
                <Link href="/dashboard/performance-reviews" className="text-indigo-600 hover:underline">
                    Back to performance reviews
                </Link>
            </div>
        );
    }

    if (isLoading && !performanceReview) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!performanceReview) return null;

    // Check if employee can acknowledge
    if (!performanceReview.metadata?.can_employee_acknowledge && performanceReview.status !== "acknowledged") {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">
                    {performanceReview.status === "acknowledged" || performanceReview.status === "completed"
                        ? "This review has already been acknowledged."
                        : "This review cannot be acknowledged at this time."}
                </p>
                <Link href={`/dashboard/performance-reviews/${id}`} className="text-indigo-600 hover:underline">
                    Back to performance review
                </Link>
            </div>
        );
    }

    // Check if current user is the employee
    if (!performanceReview.metadata?.is_current_user_employee) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">You are not authorized to acknowledge this review. Only the employee being reviewed can acknowledge this review.</p>
                <Link href={`/dashboard/performance-reviews/${id}`} className="text-indigo-600 hover:underline">
                    Back to performance review
                </Link>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.PERFORMANCE_REVIEWS.VIEW_ALL}>
            <div className="space-y-6 bg-gray-50 min-h-full">
                <PageHeader
                    title="Acknowledge Performance Review"
                    description={`Performance Review #${performanceReview.id} - ${performanceReview.employee ? `${performanceReview.employee.first_name} ${performanceReview.employee.last_name}` : `Employee #${performanceReview.employee_id}`}`}
                    action={
                        <Link
                            href={`/dashboard/performance-reviews/${id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </Link>
                    }
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">Review Summary</h3>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p><strong>Overall Rating:</strong> {performanceReview.overall_rating_label ?? performanceReview.overall_rating ?? "Not Rated"}</p>
                                <p><strong>Overall Score:</strong> {performanceReview.overall_score ?? "N/A"}</p>
                                {performanceReview.outcomes?.promotion_recommended && (
                                    <p className="text-green-700 font-medium">✓ Promotion Recommended</p>
                                )}
                            </div>
                        </div>

                        <FormContainer onSubmit={handleSubmit} error={error}>
                            <FormField
                                label="Acknowledgment Comments (Optional)"
                                name="employee_acknowledgment_comments"
                                type="textarea"
                                value={formData.employee_acknowledgment_comments ?? ""}
                                onChange={(e) => updateField("employee_acknowledgment_comments", e.target.value)}
                                disabled={isSubmitting}
                                rows={6}
                                placeholder="Add any comments or feedback about this performance review..."
                            />

                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> By acknowledging this review, you confirm that you have reviewed and understood the feedback provided by your manager.
                                </p>
                            </div>

                            <ActionButtons
                                submitLabel="Acknowledge Review"
                                isSubmitting={isSubmitting}
                                cancelHref={`/dashboard/performance-reviews/${id}`}
                            />
                        </FormContainer>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
