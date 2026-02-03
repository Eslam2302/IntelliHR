"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getDocuments, deleteDocument } from "@/services/api/documents";
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
import type { Document } from "@/lib/types/document";
import { getDocumentEmployeeName } from "@/lib/types/document";

type SortField = "id" | "employee_id" | "doc_type" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_id", label: "Employee", icon: "👤" },
    { field: "doc_type", label: "Type", icon: "📄" },
    { field: "created_at", label: "Created", icon: "📅" },
];

export default function DocumentsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: documents,
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
    } = useEntityList<Document>({
        fetchFunction: async (params) =>
            getDocuments({
                page: params.page,
                perPage: params.perPage,
                search: params.search,
                sortBy: params.sortBy as SortField,
                sortOrder: params.sortOrder,
                deleted: params.deleted,
            }),
        initialParams: {
            page: 1,
            perPage: 15,
            sortBy: "created_at",
            sortOrder: "desc",
            deleted: "without",
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            setDeletingId(id);
            await deleteDocument(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Document>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (d) => <div className="text-sm font-medium text-gray-900">#{d.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "employee",
            header: "Employee",
            sortable: true,
            onSort: () => handleSort("employee_id"),
            sortIcon: <TableSortIcon isActive={sortBy === "employee_id"} sortOrder={sortOrder} />,
            render: (d) => (
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                        {getDocumentEmployeeName(d)}
                    </div>
                    {d.deleted_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "doc_type",
            header: "Type",
            sortable: true,
            onSort: () => handleSort("doc_type"),
            sortIcon: <TableSortIcon isActive={sortBy === "doc_type"} sortOrder={sortOrder} />,
            render: (d) => <div className="text-sm text-gray-600">{d.doc_type}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "file",
            header: "File",
            render: (d) =>
                d.file_url ? (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">
                        View / Download
                    </a>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                ),
            className: "whitespace-nowrap",
        },
        {
            key: "created_at",
            header: "Created",
            sortable: true,
            onSort: () => handleSort("created_at"),
            sortIcon: <TableSortIcon isActive={sortBy === "created_at"} sortOrder={sortOrder} />,
            render: (d) => (
                <div className="text-sm text-gray-600">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (d) => {
                if (d.deleted_at) return <div className="text-sm text-gray-400 italic">Deleted</div>;
                return (
                    <div className="flex justify-end gap-3">
                        <PermissionGuard permission={PERMISSIONS.DOCUMENTS.VIEW}>
                            <Link
                                href={`/dashboard/documents/${d.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md font-medium"
                            >
                                View
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.DOCUMENTS.EDIT}>
                            <Link
                                href={`/dashboard/documents/${d.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md font-medium"
                            >
                                Edit
                            </Link>
                        </PermissionGuard>
                        <PermissionButton
                            permission={PERMISSIONS.DOCUMENTS.DELETE}
                            onClick={() => handleDelete(d.id)}
                            disabled={deletingId === d.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                        >
                            {deletingId === d.id ? "Deleting..." : "Delete"}
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
                title="Documents"
                description="Manage employee documents"
                action={
                    <PermissionGuard permission={PERMISSIONS.DOCUMENTS.CREATE}>
                        <Link
                            href="/dashboard/documents/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Upload document
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search documents..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && documents.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && documents.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : documents.length === 0 ? (
                    <EmptyState
                        title="No documents"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Upload your first document."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.DOCUMENTS.CREATE}>
                                    <Link href="/dashboard/documents/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Upload document
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={documents} columns={columns} rowKey={(d) => `doc-${d.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="documents"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
