"use client";

import { useEntityList } from "@/hooks/useEntityList";
import Link from "next/link";
import { getTeamAttendances } from "@/services/api/attendances";
import { ProtectedPage } from "@/components/common/ProtectedPage";
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

const statusLabels: Record<string, string> = {
    present: "Present",
    absent: "Absent",
    half_day: "Half day",
    on_leave: "On leave",
    late: "Late",
};

export default function TeamAttendancesPage() {
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
            return getTeamAttendances({
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
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (a) => {
                if (a.deleted_at) {
                    return <div className="text-sm text-gray-400 italic">Deleted</div>;
                }
                return (
                    <div className="flex justify-end">
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
                    </div>
                );
            },
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <ProtectedPage permission={PERMISSIONS.LEAVE_REQUESTS.VIEW_EMPLOYEES}>
            <div className="space-y-6 bg-gray-50 min-h-full">
                <PageHeader
                    title="Team attendance"
                    description="View attendance records for your direct reports"
                />
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                        <div className="space-y-4">
                            <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search team attendances..." />
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
                            title="No team attendances"
                            description={searchQuery ? `No records match "${searchQuery}".` : "No attendance records for your team yet."}
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
        </ProtectedPage>
    );
}
