"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getAttendances, deleteAttendance } from "@/services/api/attendances";
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
import type { Attendance } from "@/lib/types/attendance";

type SortField = "id" | "employee_id" | "date" | "check_in" | "check_out" | "status" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_id", label: "Employee", icon: "👤" },
    { field: "date", label: "Date", icon: "📅" },
    { field: "check_in", label: "Check-in", icon: "⏰" },
    { field: "check_out", label: "Check-out", icon: "⏱" },
    { field: "status", label: "Status", icon: "📊" },
    { field: "created_at", label: "Created", icon: "➕" },
];

function truncate(s: string | null | undefined, max: number): string {
    if (s == null || s === "") return "—";
    return s.length <= max ? s : s.slice(0, max) + "…";
}

const statusLabels: Record<string, string> = {
    present: "Present",
    absent: "Absent",
    half_day: "Half day",
    on_leave: "On leave",
    late: "Late",
};

export default function AttendancesPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: attendances,
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
    } = useEntityList<Attendance>({
        fetchFunction: async (params) => {
            return getAttendances({
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
            perPage: 15,
            sortBy: "check_in",
            sortOrder: "desc",
            deleted: "without",
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) {
            return;
        }
        try {
            setDeletingId(id);
            await deleteAttendance(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete attendance");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Attendance>[] = [
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
                    <div className="text-sm font-semibold text-gray-900">
                        {a.employee?.name ?? `Employee #${a.employee_id}`}
                    </div>
                    {a.deleted_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "date",
            header: "Date",
            sortable: true,
            onSort: () => handleSort("date"),
            sortIcon: <TableSortIcon isActive={sortBy === "date"} sortOrder={sortOrder} />,
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.date ? new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "check_in",
            header: "Check-in",
            sortable: true,
            onSort: () => handleSort("check_in"),
            sortIcon: <TableSortIcon isActive={sortBy === "check_in"} sortOrder={sortOrder} />,
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.check_in ? new Date(a.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "check_out",
            header: "Check-out",
            sortable: true,
            onSort: () => handleSort("check_out"),
            sortIcon: <TableSortIcon isActive={sortBy === "check_out"} sortOrder={sortOrder} />,
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.check_out ? new Date(a.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "worked_hours",
            header: "Hours",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.worked_hours != null ? `${a.worked_hours}h` : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "calculated_hours",
            header: "Calc. hrs",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.calculated_hours != null ? `${a.calculated_hours}h` : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "break_duration_minutes",
            header: "Break (min)",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.break_duration_minutes != null ? `${a.break_duration_minutes}` : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "overtime_hours",
            header: "Overtime",
            render: (a) => (
                <div className="text-sm text-gray-600">
                    {a.overtime_hours != null ? `${a.overtime_hours}h` : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "is_late",
            header: "Late",
            render: (a) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${a.is_late ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500"}`}
                >
                    {a.is_late ? "Yes" : "No"}
                </span>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("status"),
            sortIcon: <TableSortIcon isActive={sortBy === "status"} sortOrder={sortOrder} />,
            render: (a) => (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize bg-gray-100 text-gray-800">
                    {statusLabels[a.status] ?? a.status}
                </span>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "location",
            header: "Location",
            render: (a) => <div className="text-sm text-gray-600 max-w-[140px] truncate" title={a.location ?? undefined}>{truncate(a.location, 20)}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "notes",
            header: "Notes",
            render: (a) => <div className="text-sm text-gray-600 max-w-[160px] truncate" title={a.notes ?? undefined}>{truncate(a.notes, 24)}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "check_in_ip",
            header: "Check-in IP",
            render: (a) => <div className="text-sm text-gray-500 font-mono">{a.check_in_ip ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "check_out_ip",
            header: "Check-out IP",
            render: (a) => <div className="text-sm text-gray-500 font-mono">{a.check_out_ip ?? "—"}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "created_at",
            header: "Created",
            sortable: true,
            onSort: () => handleSort("created_at"),
            sortIcon: <TableSortIcon isActive={sortBy === "created_at"} sortOrder={sortOrder} />,
            render: (a) => (
                <div className="text-sm text-gray-500">
                    {a.created_at ? new Date(a.created_at).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "updated_at",
            header: "Updated",
            render: (a) => (
                <div className="text-sm text-gray-500">
                    {a.updated_at ? new Date(a.updated_at).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (a) => {
                if (a.deleted_at) {
                    return <div className="text-sm text-gray-400 italic">Deleted</div>;
                }
                return (
                    <div className="flex items-center justify-end gap-3">
                        <PermissionGuard permission={PERMISSIONS.ATTENDANCES.VIEW}>
                            <Link
                                href={`/dashboard/attendances/${a.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.ATTENDANCES.EDIT}>
                            <Link
                                href={`/dashboard/attendances/${a.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </PermissionGuard>
                        <PermissionButton
                            permission={PERMISSIONS.ATTENDANCES.DELETE}
                            onClick={() => handleDelete(a.id)}
                            disabled={deletingId === a.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deletingId === a.id ? "Deleting..." : "Delete"}
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
                title="Attendances"
                description="Manage attendance records"
                action={
                    <PermissionGuard permission={PERMISSIONS.ATTENDANCES.CREATE}>
                        <Link
                            href="/dashboard/attendances/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Attendance
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search attendances..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && attendances.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && attendances.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Retry
                        </button>
                    </div>
                ) : attendances.length === 0 ? (
                    <EmptyState
                        title="No attendances"
                        description={searchQuery ? `No records match "${searchQuery}".` : "Create your first attendance record."}
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.ATTENDANCES.CREATE}>
                                    <Link href="/dashboard/attendances/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Attendance
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto bg-white rounded-b-xl">
                            <DataTable data={attendances} columns={columns} rowKey={(a) => `attendance-${a.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="attendances"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
