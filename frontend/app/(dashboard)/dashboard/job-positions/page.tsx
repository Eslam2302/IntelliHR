"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getJobPositions, deleteJobPosition } from "@/services/api/job-positions";
import { getDepartments } from "@/services/api/departments";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PermissionButton } from "@/components/common/PermissionButton";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { SortButtons } from "@/components/ui/SortButtons";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { TableSortIcon } from "@/components/ui/TableSortIcon";
import type { JobPosition } from "@/services/api/job-positions";
import type { Department } from "@/lib/types/department";

type SortField = "id" | "title" | "grade" | "department_id" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "title", label: "Title", icon: "A-Z" },
    { field: "grade", label: "Grade", icon: "📊" },
    { field: "department_id", label: "Department", icon: "🏢" },
    { field: "created_at", label: "Created", icon: "📅" },
];

export default function JobPositionsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deptMap, setDeptMap] = useState<Record<number, string>>({});

    useEffect(() => {
        getDepartments({ perPage: 500 })
            .then((r) => {
                const m: Record<number, string> = {};
                r.data.forEach((d) => { m[d.id] = d.name; });
                setDeptMap(m);
            })
            .catch(() => setDeptMap({}));
    }, []);

    const {
        data: positions,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        perPage,
        searchQuery,
        sortBy,
        sortOrder,
        deletedFilter,
        setCurrentPage,
        setSearchQuery,
        handleSort,
        setDeletedFilter,
        refetch,
    } = useEntityList<JobPosition>({
        fetchFunction: async (params) => {
            return getJobPositions({
                page: params.page,
                perPage: params.perPage,
                search: params.search,
                sortBy: params.sortBy as SortField,
                sortOrder: params.sortOrder,
                deleted: params.deleted,
            });
        },
        initialParams: {
            page: 1,
            perPage: 10,
            sortBy: "id",
            sortOrder: "desc",
            deleted: "without",
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this job position? This action cannot be undone.")) return;
        try {
            setDeletingId(id);
            await deleteJobPosition(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<JobPosition>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (j) => <div className="text-sm font-medium text-gray-900">#{j.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "title",
            header: "Title",
            sortable: true,
            onSort: () => handleSort("title"),
            sortIcon: <TableSortIcon isActive={sortBy === "title"} sortOrder={sortOrder} />,
            render: (j) => (
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">{j.title}</div>
                    {j.deleted_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Deleted</span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "grade",
            header: "Grade",
            sortable: true,
            onSort: () => handleSort("grade"),
            sortIcon: <TableSortIcon isActive={sortBy === "grade"} sortOrder={sortOrder} />,
            render: (j) => <div className="text-sm text-gray-600">{j.grade ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "department",
            header: "Department",
            sortable: true,
            onSort: () => handleSort("department_id"),
            sortIcon: <TableSortIcon isActive={sortBy === "department_id"} sortOrder={sortOrder} />,
            render: (j) => (
                <div className="text-sm text-gray-600">
                    {j.department_id != null && deptMap[j.department_id]
                        ? deptMap[j.department_id]
                        : j.department_id != null
                            ? `Dept #${j.department_id}`
                            : "—"}
                </div>
            ),
        },
        {
            key: "salary",
            header: "Min – Max salary",
            render: (j) => (
                <div className="text-sm text-gray-600">
                    {j.min_salary != null || j.max_salary != null
                        ? `${j.min_salary ?? "—"} – ${j.max_salary ?? "—"}`
                        : "—"}
                </div>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (j) => {
                if (j.deleted_at) return <div className="text-sm text-gray-400 italic">Deleted</div>;
                return (
                    <div className="flex items-center justify-end gap-3">
                        <PermissionGuard permission={PERMISSIONS.JOB_POSITIONS.VIEW}>
                            <Link
                                href={`/dashboard/job-positions/${j.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.JOB_POSITIONS.EDIT}>
                            <Link
                                href={`/dashboard/job-positions/${j.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </PermissionGuard>
                        <PermissionButton
                            permission={PERMISSIONS.JOB_POSITIONS.DELETE}
                            onClick={() => handleDelete(j.id)}
                            disabled={deletingId === j.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deletingId === j.id ? "Deleting..." : "Delete"}
                        </PermissionButton>
                    </div>
                );
            },
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Job positions"
                description="Manage job positions"
                action={
                    <PermissionGuard permission={PERMISSIONS.JOB_POSITIONS.CREATE}>
                        <Link href="/dashboard/job-positions/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create job position
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search job positions..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && positions.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && positions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Retry</button>
                    </div>
                ) : positions.length === 0 ? (
                    <EmptyState
                        title="No job positions"
                        description={searchQuery ? `No results for "${searchQuery}".` : "Create your first job position."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.JOB_POSITIONS.CREATE}>
                                    <Link href="/dashboard/job-positions/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create job position
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto bg-white rounded-b-xl">
                            <DataTable data={positions} columns={columns} rowKey={(j) => `job-${j.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="job positions"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
