"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getInterviews, deleteInterview } from "@/services/api/interviews";
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
import type { Interview } from "@/lib/types/interview";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

type SortField = "id" | "scheduled_at" | "score" | "status" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "scheduled_at", label: "Scheduled", icon: "📅" },
    { field: "score", label: "Score", icon: "⭐" },
    { field: "status", label: "Status", icon: "✓" },
    { field: "created_at", label: "Created", icon: "➕" },
];

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
        done: { bg: "bg-green-100", text: "text-green-800" },
        canceled: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function InterviewsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: interviews,
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
    } = useEntityList<Interview>({
        fetchFunction: async (params) =>
            getInterviews({
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
        if (!confirm("Are you sure you want to delete this interview?")) return;
        try {
            setDeletingId(id);
            await deleteInterview(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Interview>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (i) => <div className="text-sm font-medium text-gray-900">#{i.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "applicant",
            header: "Applicant",
            render: (i) => (
                <div className="text-sm text-gray-600">
                    {i.applicant ? `${i.applicant.first_name} ${i.applicant.last_name}` : (i.applicant_id ? `Applicant #${i.applicant_id}` : "—")}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "interviewer",
            header: "Interviewer",
            render: (i) => (
                <div className="text-sm text-gray-600">
                    {i.interviewer ? getEmployeeDisplayLabel(i.interviewer, i.interviewer_id) : (i.interviewer_id ? `Employee #${i.interviewer_id}` : "—")}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "scheduled_at",
            header: "Scheduled",
            sortable: true,
            onSort: () => handleSort("scheduled_at"),
            sortIcon: <TableSortIcon isActive={sortBy === "scheduled_at"} sortOrder={sortOrder} />,
            render: (i) => (
                <div className="text-sm text-gray-600">
                    {i.scheduled_at ? new Date(i.scheduled_at).toLocaleString() : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "score",
            header: "Score",
            sortable: true,
            onSort: () => handleSort("score"),
            sortIcon: <TableSortIcon isActive={sortBy === "score"} sortOrder={sortOrder} />,
            render: (i) => <div className="text-sm text-gray-600">{i.score ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("status"),
            sortIcon: <TableSortIcon isActive={sortBy === "status"} sortOrder={sortOrder} />,
            render: (i) => statusBadge(i.status),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (i) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.INTERVIEWS.VIEW}>
                        <Link
                            href={`/dashboard/interviews/${i.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.INTERVIEWS.EDIT}>
                        <Link
                            href={`/dashboard/interviews/${i.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.INTERVIEWS.DELETE}
                        onClick={() => handleDelete(i.id)}
                        disabled={deletingId === i.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === i.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Interviews"
                description="Manage interviews"
                action={
                    <PermissionGuard permission={PERMISSIONS.INTERVIEWS.CREATE}>
                        <Link
                            href="/dashboard/interviews/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create interview
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search interviews..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && interviews.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && interviews.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : interviews.length === 0 ? (
                    <EmptyState
                        title="No interviews"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first interview."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.INTERVIEWS.CREATE}>
                                    <Link href="/dashboard/interviews/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create interview
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={interviews} columns={columns} rowKey={(i) => `interview-${i.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="interviews"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
