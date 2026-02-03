"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getDeductions, deleteDeduction } from "@/services/api/deductions";
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
import type { Deduction } from "@/lib/types/deduction";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

type SortField = "id" | "employee_id" | "type" | "amount" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_id", label: "Employee", icon: "👤" },
    { field: "type", label: "Type", icon: "📋" },
    { field: "amount", label: "Amount", icon: "💰" },
    { field: "created_at", label: "Created", icon: "➕" },
];

export default function DeductionsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: deductions,
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
    } = useEntityList<Deduction>({
        fetchFunction: async (params) =>
            getDeductions({
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
        if (!confirm("Are you sure you want to delete this deduction?")) return;
        try {
            setDeletingId(id);
            await deleteDeduction(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Deduction>[] = [
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
                    <span className="text-sm font-semibold text-gray-900">
                        {getEmployeeDisplayLabel(d.employee, d.employee_id)}
                    </span>
                    {d.employee?.deleted_at && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "type",
            header: "Type",
            sortable: true,
            onSort: () => handleSort("type"),
            sortIcon: <TableSortIcon isActive={sortBy === "type"} sortOrder={sortOrder} />,
            render: (d) => (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                    {d.type}
                </span>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "amount",
            header: "Amount",
            sortable: true,
            onSort: () => handleSort("amount"),
            sortIcon: <TableSortIcon isActive={sortBy === "amount"} sortOrder={sortOrder} />,
            render: (d) => (
                <div className="text-sm text-gray-600">
                    {new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(d.amount)}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "payroll",
            header: "Payroll",
            render: (d) => (
                <div className="text-sm text-gray-600">
                    {d.payroll ? `${d.payroll.year}/${d.payroll.month}` : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (d) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.DEDUCTIONS.VIEW}>
                        <Link
                            href={`/dashboard/deductions/${d.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.DEDUCTIONS.EDIT}>
                        <Link
                            href={`/dashboard/deductions/${d.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.DEDUCTIONS.DELETE}
                        onClick={() => handleDelete(d.id)}
                        disabled={deletingId === d.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === d.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Deductions"
                description="Manage employee deductions"
                action={
                    <PermissionGuard permission={PERMISSIONS.DEDUCTIONS.CREATE}>
                        <Link
                            href="/dashboard/deductions/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create deduction
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search deductions..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && deductions.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && deductions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : deductions.length === 0 ? (
                    <EmptyState
                        title="No deductions"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first deduction."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.DEDUCTIONS.CREATE}>
                                    <Link href="/dashboard/deductions/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create deduction
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={deductions} columns={columns} rowKey={(d) => `deduction-${d.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="deductions"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
