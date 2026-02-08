"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAssets, deleteAsset } from "@/services/api/assets";
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
import type { Asset } from "@/lib/types/asset";

type SortField = "id" | "name" | "serial_number" | "status" | "condition" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "name", label: "Name", icon: "📦" },
    { field: "serial_number", label: "Serial", icon: "🔢" },
    { field: "status", label: "Status", icon: "✓" },
    { field: "condition", label: "Condition", icon: "🔧" },
    { field: "created_at", label: "Created", icon: "➕" },
];

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "available", label: "Available" },
    { value: "assigned", label: "Assigned" },
    { value: "maintenance", label: "Maintenance" },
    { value: "retired", label: "Retired" },
];

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        available: { bg: "bg-green-100", text: "text-green-800" },
        assigned: { bg: "bg-blue-100", text: "text-blue-800" },
        maintenance: { bg: "bg-yellow-100", text: "text-yellow-800" },
        retired: { bg: "bg-gray-100", text: "text-gray-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function AssetsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const {
        data: assets,
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
    } = useEntityList<Asset>({
        fetchFunction: async (params) =>
            getAssets({
                page: params.page,
                perPage: params.perPage,
                search: params.search,
                sortBy: params.sortBy as SortField,
                sortOrder: params.sortOrder,
                status: statusFilter || undefined,
            }),
        initialParams: {
            page: 1,
            perPage: 15,
            sortBy: "created_at",
            sortOrder: "desc",
        },
    });

    useEffect(() => {
        refetch();
    }, [statusFilter, refetch]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        try {
            setDeletingId(id);
            await deleteAsset(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Asset>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (asset) => <div className="text-sm font-medium text-gray-900">#{asset.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "name",
            header: "Name",
            sortable: true,
            onSort: () => handleSort("name"),
            sortIcon: <TableSortIcon isActive={sortBy === "name"} sortOrder={sortOrder} />,
            render: (asset) => <div className="text-sm font-semibold text-gray-900">{asset.name}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "serial_number",
            header: "Serial Number",
            sortable: true,
            onSort: () => handleSort("serial_number"),
            sortIcon: <TableSortIcon isActive={sortBy === "serial_number"} sortOrder={sortOrder} />,
            render: (asset) => <div className="text-sm text-gray-600">{asset.serial_number}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "condition",
            header: "Condition",
            sortable: true,
            onSort: () => handleSort("condition"),
            sortIcon: <TableSortIcon isActive={sortBy === "condition"} sortOrder={sortOrder} />,
            render: (asset) => <div className="text-sm text-gray-600">{asset.condition ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("status"),
            sortIcon: <TableSortIcon isActive={sortBy === "status"} sortOrder={sortOrder} />,
            render: (asset) => statusBadge(asset.status),
            className: "whitespace-nowrap",
        },
        {
            key: "current_assignment",
            header: "Assigned To",
            render: (asset) => (
                <div className="text-sm text-gray-600">
                    {asset.current_assignment ? (
                        <Link href={`/dashboard/employees/${asset.current_assignment.employee_id}`} className="text-indigo-600 hover:underline">
                            {asset.current_assignment.employee?.name || 
                             (asset.current_assignment.employee?.first_name && asset.current_assignment.employee?.last_name
                                ? `${asset.current_assignment.employee.first_name} ${asset.current_assignment.employee.last_name}`
                                : `Employee #${asset.current_assignment.employee_id}`)}
                        </Link>
                    ) : (
                        "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (asset) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.ASSETS.VIEW}>
                        <Link
                            href={`/dashboard/assets/${asset.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.ASSETS.EDIT}>
                        <Link
                            href={`/dashboard/assets/${asset.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.ASSETS.DELETE}
                        onClick={() => handleDelete(asset.id)}
                        disabled={deletingId === asset.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === asset.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Assets"
                description="Manage company assets"
                action={
                    <PermissionGuard permission={PERMISSIONS.ASSETS.CREATE}>
                        <Link
                            href="/dashboard/assets/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create asset
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search assets..." />
                        <div className="flex flex-wrap gap-4 items-center">
                            <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                            <div className="flex items-center gap-2">
                                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                                    Status:
                                </label>
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                {isLoading && assets.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && assets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : assets.length === 0 ? (
                    <EmptyState
                        title="No assets"
                        description={searchQuery || statusFilter ? `No records match your filters.` : "Create your first asset."}
                        action={
                            !searchQuery && !statusFilter ? (
                                <PermissionGuard permission={PERMISSIONS.ASSETS.CREATE}>
                                    <Link href="/dashboard/assets/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create asset
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={assets} columns={columns} rowKey={(asset) => `asset-${asset.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="assets"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
