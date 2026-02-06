"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getApplicants, deleteApplicant } from "@/services/api/applicants";
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
import type { Applicant } from "@/lib/types/applicant";

type SortField = "id" | "first_name" | "last_name" | "email" | "status" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "first_name", label: "First name", icon: "👤" },
    { field: "last_name", label: "Last name", icon: "👤" },
    { field: "email", label: "Email", icon: "📧" },
    { field: "status", label: "Status", icon: "✓" },
    { field: "created_at", label: "Created", icon: "➕" },
];

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        new: { bg: "bg-blue-100", text: "text-blue-800" },
        shortlisted: { bg: "bg-yellow-100", text: "text-yellow-800" },
        interviewed: { bg: "bg-purple-100", text: "text-purple-800" },
        hired: { bg: "bg-emerald-100", text: "text-emerald-800" },
        rejected: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function ApplicantsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: applicants,
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
    } = useEntityList<Applicant>({
        fetchFunction: async (params) =>
            getApplicants({
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
        if (!confirm("Are you sure you want to delete this applicant?")) return;
        try {
            setDeletingId(id);
            await deleteApplicant(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Applicant>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (a) => <div className="text-sm font-medium text-gray-900">#{a.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "name",
            header: "Name",
            render: (a) => (
                <div className="text-sm font-semibold text-gray-900">
                    {a.first_name} {a.last_name}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "email",
            header: "Email",
            sortable: true,
            onSort: () => handleSort("email"),
            sortIcon: <TableSortIcon isActive={sortBy === "email"} sortOrder={sortOrder} />,
            render: (a) => <div className="text-sm text-gray-600">{a.email}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "job",
            header: "Job post",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.job?.title ?? (a.job_id ? `Job #${a.job_id}` : "—")}
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
            render: (a) => statusBadge(a.status),
            className: "whitespace-nowrap",
        },
        {
            key: "ai_score",
            header: "AI Score",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.ai_score != null ? `${a.ai_score}%` : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (a) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.APPLICANTS.VIEW}>
                        <Link
                            href={`/dashboard/applicants/${a.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.APPLICANTS.EDIT}>
                        <Link
                            href={`/dashboard/applicants/${a.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.APPLICANTS.DELETE}
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === a.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Applicants"
                description="Manage job applicants"
                action={
                    <PermissionGuard permission={PERMISSIONS.APPLICANTS.CREATE}>
                        <Link
                            href="/dashboard/applicants/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create applicant
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search applicants..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && applicants.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && applicants.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : applicants.length === 0 ? (
                    <EmptyState
                        title="No applicants"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first applicant."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.APPLICANTS.CREATE}>
                                    <Link href="/dashboard/applicants/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create applicant
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={applicants} columns={columns} rowKey={(a) => `applicant-${a.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="applicants"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
