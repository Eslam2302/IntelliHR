"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getAllowances, deleteAllowance } from "@/services/api/allowances";
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
import type { Allowance } from "@/lib/types/allowance";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

type SortField = "id" | "employee_id" | "type" | "amount" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_id", label: "Employee", icon: "👤" },
    { field: "type", label: "Type", icon: "📋" },
    { field: "amount", label: "Amount", icon: "💰" },
    { field: "created_at", label: "Created", icon: "➕" },
];

export default function AllowancesPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: allowances,
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
    } = useEntityList<Allowance>({
        fetchFunction: async (params) =>
            getAllowances({
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
        if (!confirm("Are you sure you want to delete this allowance?")) return;
        try {
            setDeletingId(id);
            await deleteAllowance(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Allowance>[] = [
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
            key: "employee",
            header: "Employee",
            sortable: true,
            onSort: () => handleSort("employee_id"),
            sortIcon: <TableSortIcon isActive={sortBy === "employee_id"} sortOrder={sortOrder} />,
            render: (a) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                        {getEmployeeDisplayLabel(a.employee, a.employee_id)}
                    </span>
                    {a.employee?.deleted_at && (
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
            render: (a) => (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                    {a.type}
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
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(a.amount)}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "payroll",
            header: "Payroll",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.payroll ? `${a.payroll.year}/${a.payroll.month}` : "—"}
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
                    <PermissionGuard permission={PERMISSIONS.ALLOWANCES.VIEW}>
                        <Link
                            href={`/dashboard/allowances/${a.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.ALLOWANCES.EDIT}>
                        <Link
                            href={`/dashboard/allowances/${a.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.ALLOWANCES.DELETE}
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
                title="Allowances"
                description="Manage employee allowances"
                action={
                    <PermissionGuard permission={PERMISSIONS.ALLOWANCES.CREATE}>
                        <Link
                            href="/dashboard/allowances/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create allowance
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search allowances..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && allowances.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && allowances.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : allowances.length === 0 ? (
                    <EmptyState
                        title="No allowances"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first allowance."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.ALLOWANCES.CREATE}>
                                    <Link href="/dashboard/allowances/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create allowance
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={allowances} columns={columns} rowKey={(a) => `allowance-${a.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="allowances"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
