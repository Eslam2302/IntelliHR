"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getReviewRating } from "@/services/api/review-ratings";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { ReviewRating } from "@/lib/types/review-rating";

function getPerformanceReviewDisplayLabel(reviewRating: ReviewRating): string {
    if (!reviewRating.performance_review) {
        return reviewRating.performance_review_id ? `Review #${reviewRating.performance_review_id}` : "—";
    }
    
    const pr = reviewRating.performance_review;
    const employeeName = pr.employee 
        ? getEmployeeDisplayLabel(pr.employee, pr.employee.id)
        : `Employee #${pr.employee?.id || '?'}`;
    const cycleName = pr.evaluation_cycle?.name || `Cycle #${pr.evaluation_cycle?.id || '?'}`;
    
    return `${employeeName} - ${cycleName}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function ReviewRatingViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: reviewRating, isLoading, error } = useEntity<ReviewRating>({
        fetchFunction: getReviewRating,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid review rating ID</p>
                <Link href="/dashboard/review-ratings" className="text-indigo-600 hover:underline">
                    Back to review ratings
                </Link>
            </div>
        );
    }

    if (isLoading && !reviewRating) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !reviewRating) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/review-ratings" className="text-indigo-600 hover:underline">
                    Back to review ratings
                </Link>
            </div>
        );
    }

    if (!reviewRating) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Review Rating #${reviewRating.id}`}
                description="Review rating details"
                action={
                    <PermissionGuard permission={PERMISSIONS.REVIEW_RATINGS.EDIT}>
                        <Link
                            href={`/dashboard/review-ratings/${reviewRating.id}/edit`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Performance Review"
                            value={
                                reviewRating.performance_review_id ? (
                                    <Link href={`/dashboard/performance-reviews/${reviewRating.performance_review_id}`} className="text-indigo-600 hover:underline">
                                        {getPerformanceReviewDisplayLabel(reviewRating)}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Competency"
                            value={
                                reviewRating.competency ? (
                                    <Link href={`/dashboard/competencies/${reviewRating.competency.id}`} className="text-indigo-600 hover:underline">
                                        {reviewRating.competency.name}
                                    </Link>
                                ) : reviewRating.competency_id ? (
                                    `Competency #${reviewRating.competency_id}`
                                ) : null
                            }
                        />
                        <DetailRow label="Self Rating" value={reviewRating.self_rating} />
                        <DetailRow label="Self Rating Comment" value={reviewRating.self_rating_comment ? <div className="whitespace-pre-wrap">{reviewRating.self_rating_comment}</div> : null} />
                        <DetailRow label="Manager Rating" value={reviewRating.manager_rating} />
                        <DetailRow label="Manager Rating Comment" value={reviewRating.manager_rating_comment ? <div className="whitespace-pre-wrap">{reviewRating.manager_rating_comment}</div> : null} />
                        <DetailRow label="Rating Gap" value={reviewRating.rating_gap} />
                        <DetailRow label="Created" value={reviewRating.created_at ? new Date(reviewRating.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={reviewRating.updated_at ? new Date(reviewRating.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
