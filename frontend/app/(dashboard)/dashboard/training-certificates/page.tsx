"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getTrainingCertificates, deleteTrainingCertificate } from "@/services/api/training-certificates";
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
import type { TrainingCertificate } from "@/lib/types/training-certificate";

type SortField = "id" | "employee_training_id" | "issued_at" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_training_id", label: "Employee training", icon: "📋" },
    { field: "issued_at", label: "Issued", icon: "📅" },
    { field: "created_at", label: "Created", icon: "➕" },
];

export default function TrainingCertificatesPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: certificates,
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
    } = useEntityList<TrainingCertificate>({
        fetchFunction: async (params) =>
            getTrainingCertificates({
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
        if (!confirm("Are you sure you want to delete this certificate?")) return;
        try {
            setDeletingId(id);
            await deleteTrainingCertificate(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<TrainingCertificate>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (c) => <div className="text-sm font-medium text-gray-900">#{c.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "employee_training",
            header: "Employee training",
            sortable: true,
            onSort: () => handleSort("employee_training_id"),
            sortIcon: <TableSortIcon isActive={sortBy === "employee_training_id"} sortOrder={sortOrder} />,
            render: (c) => (
                <Link href={`/dashboard/employee-trainings/${c.employee_training_id}`} className="text-indigo-600 hover:underline font-medium">
                    {c.employee_training?.display_label ?? (c.employee_training_id != null ? `Record #${c.employee_training_id}` : "—")}
                </Link>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "issued_at",
            header: "Issued at",
            sortable: true,
            onSort: () => handleSort("issued_at"),
            sortIcon: <TableSortIcon isActive={sortBy === "issued_at"} sortOrder={sortOrder} />,
            render: (c) => (
                <div className="text-sm text-gray-600">
                    {c.issued_at ? new Date(c.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "certificate_path",
            header: "File",
            render: (c) => <div className="text-sm text-gray-600">{c.certificate_path ? "Yes" : "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (c) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.TRAINING_CERTIFICATES.VIEW}>
                        <Link
                            href={`/dashboard/training-certificates/${c.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.TRAINING_CERTIFICATES.EDIT}>
                        <Link
                            href={`/dashboard/training-certificates/${c.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.TRAINING_CERTIFICATES.DELETE}
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === c.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Training certificates"
                description="Manage training certificates"
                action={
                    <PermissionGuard permission={PERMISSIONS.TRAINING_CERTIFICATES.CREATE}>
                        <Link
                            href="/dashboard/training-certificates/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create certificate
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search certificates..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && certificates.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && certificates.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : certificates.length === 0 ? (
                    <EmptyState
                        title="No training certificates"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first certificate."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.TRAINING_CERTIFICATES.CREATE}>
                                    <Link href="/dashboard/training-certificates/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create certificate
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={certificates} columns={columns} rowKey={(c) => `cert-${c.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="certificates"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
