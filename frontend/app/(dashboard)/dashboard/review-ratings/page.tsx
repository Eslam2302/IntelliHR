"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getReviewRatings, deleteReviewRating } from "@/services/api/review-ratings";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PermissionButton } from "@/components/common/PermissionButton";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
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

export default function ReviewRatingsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: reviewRatings,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        perPage,
        setCurrentPage,
        refetch,
    } = useEntityList<ReviewRating>({
        fetchFunction: async () => getReviewRatings({}),
        initialParams: {
            page: 1,
            perPage: 15,
            sortBy: "id",
            sortOrder: "desc",
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this review rating?")) return;
        try {
            setDeletingId(id);
            await deleteReviewRating(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<ReviewRating>[] = [
        {
            key: "id",
            header: "ID",
            render: (rr) => <div className="text-sm font-medium text-gray-900">#{rr.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "performance_review",
            header: "Performance Review",
            render: (rr) => (
                <div className="text-sm text-gray-600">
                    {rr.performance_review_id ? (
                        <Link href={`/dashboard/performance-reviews/${rr.performance_review_id}`} className="text-indigo-600 hover:underline">
                            {getPerformanceReviewDisplayLabel(rr)}
                        </Link>
                    ) : (
                        "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "competency",
            header: "Competency",
            render: (rr) => (
                <div className="text-sm text-gray-600">
                    {rr.competency ? (
                        <Link href={`/dashboard/competencies/${rr.competency.id}`} className="text-indigo-600 hover:underline">
                            {rr.competency.name}
                        </Link>
                    ) : rr.competency_id ? (
                        `Competency #${rr.competency_id}`
                    ) : (
                        "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "self_rating",
            header: "Self Rating",
            render: (rr) => <div className="text-sm text-gray-600">{rr.self_rating ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "manager_rating",
            header: "Manager Rating",
            render: (rr) => <div className="text-sm text-gray-600">{rr.manager_rating ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "rating_gap",
            header: "Gap",
            render: (rr) => <div className="text-sm text-gray-600">{rr.rating_gap ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (rr) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.REVIEW_RATINGS.VIEW}>
                        <Link
                            href={`/dashboard/review-ratings/${rr.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.REVIEW_RATINGS.EDIT}>
                        <Link
                            href={`/dashboard/review-ratings/${rr.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.REVIEW_RATINGS.DELETE}
                        onClick={() => handleDelete(rr.id)}
                        disabled={deletingId === rr.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === rr.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Review ratings"
                description="Manage performance review ratings"
                action={
                    <PermissionGuard permission={PERMISSIONS.REVIEW_RATINGS.CREATE}>
                        <Link
                            href="/dashboard/review-ratings/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create review rating
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {isLoading && reviewRatings.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && reviewRatings.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : reviewRatings.length === 0 ? (
                    <EmptyState
                        title="No review ratings"
                        description="Create your first review rating."
                        action={
                            <PermissionGuard permission={PERMISSIONS.REVIEW_RATINGS.CREATE}>
                                <Link href="/dashboard/review-ratings/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    Create review rating
                                </Link>
                            </PermissionGuard>
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={reviewRatings} columns={columns} rowKey={(rr) => `review-rating-${rr.id}`} striped />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
