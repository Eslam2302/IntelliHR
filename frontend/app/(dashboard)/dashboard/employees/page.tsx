"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState } from "react";
import Link from "next/link";
import { getEmployees, deleteEmployee } from "@/services/api/employees";
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
import type { Employee } from "@/lib/types/employee";

type SortField = "id" | "first_name" | "gender" | "birth_date" | "department_id" | "manager_id" | "job_id" | "hire_date" | "employee_status" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "🔢" },
    { field: "first_name", label: "First Name", icon: "👤" },
    { field: "gender", label: "Gender", icon: "⚧️" },
    { field: "birth_date", label: "Birth Date", icon: "🎂" },
    { field: "department_id", label: "Department", icon: "🏢" },
    { field: "manager_id", label: "Manager", icon: "👔" },
    { field: "job_id", label: "Job", icon: "💼" },
    { field: "hire_date", label: "Hire Date", icon: "📅" },
    { field: "employee_status", label: "Status", icon: "📊" },
    { field: "created_at", label: "Created", icon: "➕" },
];
export default function EmployeesPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: employees,
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
    } = useEntityList<Employee>({
        fetchFunction: async (params) => {
            return getEmployees({
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

        if (
            !confirm("Are you sure you want to delete this employee? This action cannot be undone.")
        ) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteEmployee(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete employee");
        } finally {
            setDeletingId(null);
        }
    }

    const columns: Column<Employee>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm font-medium text-gray-900">#{employee.id}</div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "name",
            header: "Name",
            sortable: true,
            onSort: () => handleSort("first_name"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "first_name"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                        {employee.first_name} {employee.last_name}
                    </div>
                    {employee.deleted_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "work_email",
            header: "Email",
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.work_email || (
                        <span className="italic text-gray-400">No email</span>
                    )}
                </div>
            ),
        },
        {
            key: "phone",
            header: "Phone",
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.phone || (
                        <span className="italic text-gray-400">No phone</span>
                    )}
                </div>
            ),
        },
        {
            key: "gender",
            header: "Gender",
            sortable: true,
            onSort: () => handleSort("gender"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "gender"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600 capitalize">
                    {employee.gender}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "birth_date",
            header: "Birth Date",
            sortable: true,
            onSort: () => handleSort("birth_date"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "birth_date"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.birth_date
                        ? new Date(employee.birth_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "-"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "department",
            header: "Department",
            sortable: true,
            onSort: () => handleSort("department_id"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "department_id"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.department ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium">
                            {employee.department.name}
                        </span>
                    ) : employee.department_id ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            Dept #{employee.department_id}
                        </span>
                    ) : (
                        <span className="italic text-gray-400">No department</span>
                    )}
                </div>
            ),
        },
        {
            key: "job",
            header: "Job Position",
            sortable: true,
            onSort: () => handleSort("job_id"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "job_id"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.job ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                            {employee.job.title}
                        </span>
                    ) : employee.job_id ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            Job #{employee.job_id}
                        </span>
                    ) : (
                        <span className="italic text-gray-400">No job</span>
                    )}
                </div>
            ),
        },
        {
            key: "manager",
            header: "Manager",
            sortable: true,
            onSort: () => handleSort("manager_id"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "manager_id"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.manager ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                            {employee.manager.first_name} {employee.manager.last_name}
                        </span>
                    ) : employee.manager_id ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            Manager #{employee.manager_id}
                        </span>
                    ) : (
                        <span className="italic text-gray-400">No manager</span>
                    )}
                </div>
            ),
        },
        {
            key: "employee_status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("employee_status"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "employee_status"} sortOrder={sortOrder} />
            ),
            render: (employee) => {
                const statusColors = {
                    active: "bg-green-100 text-green-800",
                    probation: "bg-yellow-100 text-yellow-800",
                    resigned: "bg-gray-100 text-gray-800",
                    terminated: "bg-red-100 text-red-800",
                };
                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${statusColors[employee.employee_status] || "bg-gray-100 text-gray-800"}`}>
                        {employee.employee_status}
                    </span>
                );
            },
            className: "whitespace-nowrap",
        },
        {
            key: "hire_date",
            header: "Hire Date",
            sortable: true,
            onSort: () => handleSort("hire_date"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "hire_date"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.hire_date
                        ? new Date(employee.hire_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "-"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "created_at",
            header: "Created",
            sortable: true,
            onSort: () => handleSort("created_at"),
            sortIcon: (
                <TableSortIcon isActive={sortBy === "created_at"} sortOrder={sortOrder} />
            ),
            render: (employee) => (
                <div className="text-sm text-gray-600">
                    {employee.created_at
                        ? new Date(employee.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : "-"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (employee) => {
                if (employee.deleted_at) {
                    return (
                        <div className="text-sm text-gray-400 italic">Deleted</div>
                    );
                }

                return (
                    <div className="flex items-center justify-end gap-3">
                        <PermissionGuard permission={PERMISSIONS.EMPLOYEES.VIEW}>
                            <Link
                                href={`/dashboard/employees/${employee.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.EMPLOYEES.EDIT}>
                            <Link
                                href={`/dashboard/employees/${employee.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </PermissionGuard>
                        <PermissionButton
                            permission={PERMISSIONS.EMPLOYEES.DELETE}
                            onClick={() => handleDelete(employee.id)}
                            disabled={deletingId === employee.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deletingId === employee.id ? "Deleting..." : "Delete"}
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
                title="Employees"
                description="Manage your organization's employees"
                action={
                    <PermissionGuard permission={PERMISSIONS.EMPLOYEES.CREATE}>
                        <Link
                            href="/dashboard/employees/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Employee
                        </Link>
                    </PermissionGuard>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search employees..."
                        />
                        <SortButtons
                            options={sortOptions}
                            sortBy={sortBy as SortField}
                            sortOrder={sortOrder}
                            onSort={(field) => handleSort(field as string)}
                        />
                    </div>
                </div>

                {isLoading && employees.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && employees.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : employees.length === 0 ? (
                    <EmptyState
                        title="No employees found"
                        description={
                            searchQuery
                                ? `No employees match "${searchQuery}". Try adjusting your search criteria.`
                                : "Get started by creating your first employee."
                        }
                        action={
                            !searchQuery ? (
                                <PermissionGuard permission={PERMISSIONS.EMPLOYEES.CREATE}>
                                    <Link
                                        href="/dashboard/employees/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Your First Employee
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto bg-white rounded-b-xl">
                            <DataTable
                                data={employees}
                                columns={columns}
                                rowKey={(employee) => `employee-${employee.id}`}
                                striped={true}
                            />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="employees"
                        />
                    </>
                )}
            </div>
        </div>
    );
}