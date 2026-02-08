"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getExpenses, deleteExpense } from "@/services/api/expenses";
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
import type { Expense } from "@/lib/types/expense";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

type SortField = "id" | "amount" | "expense_date" | "status" | "created_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "amount", label: "Amount", icon: "💰" },
    { field: "expense_date", label: "Date", icon: "📅" },
    { field: "status", label: "Status", icon: "✓" },
    { field: "created_at", label: "Created", icon: "➕" },
];

const STATUS_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
        approved: { bg: "bg-green-100", text: "text-green-800" },
        rejected: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function ExpensesPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const {
        data: expenses,
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
    } = useEntityList<Expense>({
        fetchFunction: async (params) =>
            getExpenses({
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
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            setDeletingId(id);
            await deleteExpense(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Expense>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (exp) => <div className="text-sm font-medium text-gray-900">#{exp.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "employee",
            header: "Employee",
            render: (exp) => (
                <div className="text-sm text-gray-900">
                    {exp.employee ? (
                        <Link href={`/dashboard/employees/${exp.employee.id}`} className="text-indigo-600 hover:underline">
                            {getEmployeeDisplayLabel(exp.employee, exp.employee.id)}
                        </Link>
                    ) : (
                        exp.employee_id ? `Employee #${exp.employee_id}` : "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "category",
            header: "Category",
            render: (exp) => (
                <div className="text-sm text-gray-600">
                    {exp.category ? (
                        <Link href={`/dashboard/expense-categories/${exp.category.id}`} className="text-indigo-600 hover:underline">
                            {exp.category.name}
                        </Link>
                    ) : (
                        exp.category_id ? `Category #${exp.category_id}` : "—"
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "amount",
            header: "Amount",
            sortable: true,
            onSort: () => handleSort("amount"),
            sortIcon: <TableSortIcon isActive={sortBy === "amount"} sortOrder={sortOrder} />,
            render: (exp) => <div className="text-sm font-semibold text-gray-900">${exp.amount.toFixed(2)}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "expense_date",
            header: "Date",
            sortable: true,
            onSort: () => handleSort("expense_date"),
            sortIcon: <TableSortIcon isActive={sortBy === "expense_date"} sortOrder={sortOrder} />,
            render: (exp) => (
                <div className="text-sm text-gray-600">
                    {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : "—"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("status"),
            sortIcon: <TableSortIcon isActive={sortBy === "status"} sortOrder={sortOrder} />,
            render: (exp) => statusBadge(exp.status),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (exp) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.EXPENSES.VIEW}>
                        <Link
                            href={`/dashboard/expenses/${exp.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.EXPENSES.EDIT}>
                        <Link
                            href={`/dashboard/expenses/${exp.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    <PermissionButton
                        permission={PERMISSIONS.EXPENSES.DELETE}
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === exp.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Expenses"
                description="Manage employee expenses"
                action={
                    <PermissionGuard permission={PERMISSIONS.EXPENSES.CREATE}>
                        <Link
                            href="/dashboard/expenses/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create expense
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search expenses..." />
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
                {isLoading && expenses.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && expenses.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : expenses.length === 0 ? (
                    <EmptyState
                        title="No expenses"
                        description={searchQuery || statusFilter ? `No records match your filters.` : "Create your first expense."}
                        action={
                            !searchQuery && !statusFilter ? (
                                <PermissionGuard permission={PERMISSIONS.EXPENSES.CREATE}>
                                    <Link href="/dashboard/expenses/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create expense
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={expenses} columns={columns} rowKey={(exp) => `expense-${exp.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="expenses"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
