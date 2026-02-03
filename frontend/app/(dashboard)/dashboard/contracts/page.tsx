"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getContracts, deleteContract } from "@/services/api/contracts";
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
import type { Contract } from "@/lib/types/contract";

type SortField = "id" | "employee_id" | "contract_type" | "start_date" | "end_date" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_id", label: "Employee", icon: "👤" },
    { field: "contract_type", label: "Type", icon: "📄" },
    { field: "start_date", label: "Start", icon: "📅" },
    { field: "end_date", label: "End", icon: "📅" },
    { field: "created_at", label: "Created", icon: "➕" },
];

const contractTypeLabels: Record<string, string> = {
    permanent: "Permanent",
    full_time: "Full-time",
    part_time: "Part-time",
    fixed_term: "Fixed term",
    temporary: "Temporary",
    probation: "Probation",
    internship: "Internship",
    freelance: "Freelance",
    consultant: "Consultant",
    contractor: "Contractor",
};

function formatType(s: string): string {
    return contractTypeLabels[s] ?? s.replace(/_/g, " ");
}

export default function ContractsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: contracts,
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
    } = useEntityList<Contract>({
        fetchFunction: async (params) =>
            getContracts({
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
        if (!confirm("Are you sure you want to delete this contract?")) return;
        try {
            setDeletingId(id);
            await deleteContract(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Contract>[] = [
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
            key: "employee",
            header: "Employee",
            sortable: true,
            onSort: () => handleSort("employee_id"),
            sortIcon: <TableSortIcon isActive={sortBy === "employee_id"} sortOrder={sortOrder} />,
            render: (c) => (
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                        {c.employee?.name ?? `Employee #${c.employee_id}`}
                    </div>
                    {c.deleted_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "contract_type",
            header: "Type",
            sortable: true,
            onSort: () => handleSort("contract_type"),
            sortIcon: <TableSortIcon isActive={sortBy === "contract_type"} sortOrder={sortOrder} />,
            render: (c) => (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                    {formatType(c.contract_type)}
                </span>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "start_date",
            header: "Start",
            sortable: true,
            onSort: () => handleSort("start_date"),
            sortIcon: <TableSortIcon isActive={sortBy === "start_date"} sortOrder={sortOrder} />,
            render: (c) => (
                <div className="text-sm text-gray-600">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "end_date",
            header: "End",
            sortable: true,
            onSort: () => handleSort("end_date"),
            sortIcon: <TableSortIcon isActive={sortBy === "end_date"} sortOrder={sortOrder} />,
            render: (c) => (
                <div className="text-sm text-gray-600">
                    {c.end_date ? new Date(c.end_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "salary",
            header: "Salary",
            render: (c) => (
                <div className="text-sm text-gray-600">
                    {c.salary != null ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(c.salary) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (c) => {
                if (c.deleted_at) return <div className="text-sm text-gray-400 italic">Deleted</div>;
                return (
                    <div className="flex justify-end gap-3">
                        <PermissionGuard permission={PERMISSIONS.CONTRACTS.VIEW}>
                            <Link
                                href={`/dashboard/contracts/${c.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                View
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.CONTRACTS.EDIT}>
                            <Link
                                href={`/dashboard/contracts/${c.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </PermissionGuard>
                        <PermissionButton
                            permission={PERMISSIONS.CONTRACTS.DELETE}
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
                );
            },
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Contracts"
                description="Manage employee contracts"
                action={
                    <PermissionGuard permission={PERMISSIONS.CONTRACTS.CREATE}>
                        <Link
                            href="/dashboard/contracts/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create contract
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search contracts..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && contracts.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && contracts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : contracts.length === 0 ? (
                    <EmptyState
                        title="No contracts"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first contract."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.CONTRACTS.CREATE}>
                                    <Link href="/dashboard/contracts/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create contract
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={contracts} columns={columns} rowKey={(c) => `contract-${c.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="contracts"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
