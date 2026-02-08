"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getPerformanceReviews, deletePerformanceReview } from "@/services/api/performance-reviews";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PermissionButton } from "@/components/common/PermissionButton";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { SortButtons } from "@/components/ui/SortButtons";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { TableSortIcon } from "@/components/ui/TableSortIcon";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { PerformanceReview } from "@/lib/types/performance-review";

type SortField = "id" | "status" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "status", label: "Status", icon: "✓" },
    { field: "created_at", label: "Created", icon: "➕" },
];

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        not_started: { bg: "bg-gray-100", text: "text-gray-800" },
        self_assessment_in_progress: { bg: "bg-yellow-100", text: "text-yellow-800" },
        self_assessment_submitted: { bg: "bg-blue-100", text: "text-blue-800" },
        manager_review_in_progress: { bg: "bg-orange-100", text: "text-orange-800" },
        manager_review_submitted: { bg: "bg-purple-100", text: "text-purple-800" },
        awaiting_acknowledgment: { bg: "bg-indigo-100", text: "text-indigo-800" },
        acknowledged: { bg: "bg-green-100", text: "text-green-800" },
        completed: { bg: "bg-green-100", text: "text-green-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

export default function PerformanceReviewsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: performanceReviews,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        perPage,
        searchQuery,
        sortBy,
        sortOrder,
        setCurrentPage,
        setSearchQuery,
        handleSort,
        refetch,
    } = useEntityList<PerformanceReview>({
        fetchFunction: async (params) =>
            getPerformanceReviews({
                page: params.page,
                perPage: params.perPage,
                search: params.search,
                sortBy: params.sortBy as SortField,
                sortOrder: params.sortOrder,
            }),
        initialParams: {
            page: 1,
            perPage: 15,
            sortBy: "created_at",
            sortOrder: "desc",
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this performance review?")) return;
        try {
            setDeletingId(id);
            await deletePerformanceReview(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<PerformanceReview>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (pr) => <div className="text-sm font-medium text-gray-900">#{pr.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "employee",
            header: "Employee",
            render: (pr) => (
                <div className="text-sm text-gray-600">
                    {pr.employee ? (
                        <Link href={`/dashboard/employees/${pr.employee.id}`} className="text-indigo-600 hover:underline">
                            {getEmployeeDisplayLabel(pr.employee, pr.employee.id)}
                        </Link>
                    ) : pr.employee_id ? (
                        `Employee #${pr.employee_id}`
                    ) : (
                        "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "reviewer",
            header: "Reviewer",
            render: (pr) => (
                <div className="text-sm text-gray-600">
                    {pr.reviewer ? (
                        <Link href={`/dashboard/employees/${pr.reviewer.id}`} className="text-indigo-600 hover:underline">
                            {getEmployeeDisplayLabel(pr.reviewer, pr.reviewer.id)}
                        </Link>
                    ) : pr.reviewer_id ? (
                        `Employee #${pr.reviewer_id}`
                    ) : (
                        "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "evaluation_cycle",
            header: "Evaluation Cycle",
            render: (pr) => (
                <div className="text-sm text-gray-600">
                    {pr.evaluation_cycle ? (
                        <Link href={`/dashboard/evaluation-cycles/${pr.evaluation_cycle.id}`} className="text-indigo-600 hover:underline">
                            {pr.evaluation_cycle.name}
                        </Link>
                    ) : pr.evaluation_cycle_id ? (
                        `Cycle #${pr.evaluation_cycle_id}`
                    ) : (
                        "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("status"),
            sortIcon: <TableSortIcon isActive={sortBy === "status"} sortOrder={sortOrder} />,
            render: (pr) => statusBadge(pr.status),
            className: "whitespace-nowrap",
        },
        {
            key: "overall_score",
            header: "Score",
            render: (pr) => <div className="text-sm text-gray-600">{pr.overall_score ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (pr) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.VIEW}>
                        <Link
                            href={`/dashboard/performance-reviews/${pr.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.EDIT}>
                        <Link
                            href={`/dashboard/performance-reviews/${pr.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.PERFORMANCE_REVIEWS.DELETE}
                        onClick={() => handleDelete(pr.id)}
                        disabled={deletingId === pr.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === pr.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Performance reviews"
                description="Manage employee performance reviews"
                action={
                    <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.CREATE}>
                        <Link
                            href="/dashboard/performance-reviews/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create performance review
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search performance reviews..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && performanceReviews.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && performanceReviews.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : performanceReviews.length === 0 ? (
                    <EmptyState
                        title="No performance reviews"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first performance review."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.CREATE}>
                                    <Link href="/dashboard/performance-reviews/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create performance review
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={performanceReviews} columns={columns} rowKey={(pr) => `performance-review-${pr.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="performance reviews"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
