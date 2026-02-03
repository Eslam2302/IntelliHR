"use client";

import { useEntityList } from "@/hooks/useEntityList";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getPayrolls, deletePayroll, processPayroll, payPayroll } from "@/services/api/payrolls";
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
import type { Payroll } from "@/lib/types/payroll";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

type SortField = "id" | "employee_id" | "year" | "month" | "net_pay" | "payment_status" | "created_at";

const STRIPE_TEST_TOKEN =
    process.env.NEXT_PUBLIC_STRIPE_TEST_TOKEN ||
    (process.env.NODE_ENV === "development" ? "tok_visa" : "");

const sortOptions: { field: SortField; label: string; icon: string }[] = [
    { field: "id", label: "ID", icon: "#" },
    { field: "employee_id", label: "Employee", icon: "👤" },
    { field: "year", label: "Year", icon: "📅" },
    { field: "month", label: "Month", icon: "📅" },
    { field: "net_pay", label: "Net pay", icon: "💰" },
    { field: "payment_status", label: "Status", icon: "✓" },
    { field: "created_at", label: "Created", icon: "➕" },
];

const MONTHS = [
    { value: "", label: "All months" },
    ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i, 1).toLocaleString("en-US", { month: "short" }) })),
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

function paymentStatusBadge(status: string) {
    const map: Record<string, { bg: string; text: string }> = {
        pending: { bg: "bg-amber-100", text: "text-amber-800" },
        paid: { bg: "bg-green-100", text: "text-green-800" },
        processing: { bg: "bg-blue-100", text: "text-blue-800" },
        failed: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function PayrollsPage() {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [payingId, setPayingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const [processSuccess, setProcessSuccess] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<number | "">("");
    const [monthFilter, setMonthFilter] = useState<string>("");

    const {
        data: payrolls,
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
    } = useEntityList<Payroll>({
        fetchFunction: async (params) =>
            getPayrolls({
                page: params.page,
                perPage: params.perPage,
                search: params.search,
                sortBy: params.sortBy as SortField,
                sortOrder: params.sortOrder,
                deleted: params.deleted,
                year: yearFilter !== "" ? yearFilter : undefined,
                month: monthFilter ? Number(monthFilter) : undefined,
            }),
        initialParams: {
            page: 1,
            perPage: 15,
            sortBy: "created_at",
            sortOrder: "desc",
            deleted: "without",
        },
    });

    const effectiveYear = yearFilter;
    const effectiveMonth = monthFilter;

    useEffect(() => {
        refetch();
    }, [effectiveYear, effectiveMonth, refetch]);

    const handleProcessPayroll = async () => {
        if (!confirm("Process payroll for the current month? This will create/update payroll records for eligible employees.")) return;
        try {
            setProcessing(true);
            setProcessSuccess(null);
            const res = await processPayroll();
            const msg = (res as { data?: { message?: string; processed?: number } })?.data?.message ?? "Payroll processed successfully.";
            const processed = (res as { data?: { processed?: number } })?.data?.processed;
            setProcessSuccess(processed != null ? `${msg} (${processed} records)` : msg);
            await refetch();
            setTimeout(() => setProcessSuccess(null), 5000);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to process payroll");
        } finally {
            setProcessing(false);
        }
    };

    const handlePay = async (id: number) => {
        if (!STRIPE_TEST_TOKEN) {
            alert("Stripe test token is not configured. Set NEXT_PUBLIC_STRIPE_TEST_TOKEN.");
            return;
        }
        if (!confirm("Pay this payroll using the configured Stripe test token?")) return;
        try {
            setPayingId(id);
            await payPayroll(id, STRIPE_TEST_TOKEN);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Payment failed");
        } finally {
            setPayingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this payroll record?")) return;
        try {
            setDeletingId(id);
            await deletePayroll(id);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const columns: Column<Payroll>[] = [
        {
            key: "id",
            header: "ID",
            sortable: true,
            onSort: () => handleSort("id"),
            sortIcon: <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />,
            render: (p) => <div className="text-sm font-medium text-gray-900">#{p.id}</div>,
            className: "whitespace-nowrap",
        },
        {
            key: "employee",
            header: "Employee",
            sortable: true,
            onSort: () => handleSort("employee_id"),
            sortIcon: <TableSortIcon isActive={sortBy === "employee_id"} sortOrder={sortOrder} />,
            render: (p) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                        {getEmployeeDisplayLabel(p.employee, p.employee_id)}
                    </span>
                    {p.employee?.deleted_at && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
                            Deleted
                        </span>
                    )}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "period",
            header: "Period",
            sortable: true,
            onSort: () => handleSort("year"),
            sortIcon: <TableSortIcon isActive={sortBy === "year"} sortOrder={sortOrder} />,
            render: (p) => (
                <div className="text-sm text-gray-600">
                    {p.year}/{String(p.month).padStart(2, "0")}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "basic_salary",
            header: "Basic",
            render: (p) => (
                <div className="text-sm text-gray-600">
                    {new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(p.basic_salary ?? 0)}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "net_pay",
            header: "Net pay",
            sortable: true,
            onSort: () => handleSort("net_pay"),
            sortIcon: <TableSortIcon isActive={sortBy === "net_pay"} sortOrder={sortOrder} />,
            render: (p) => (
                <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(p.net_pay ?? 0)}
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "payment_status",
            header: "Status",
            sortable: true,
            onSort: () => handleSort("payment_status"),
            sortIcon: <TableSortIcon isActive={sortBy === "payment_status"} sortOrder={sortOrder} />,
            render: (p) => paymentStatusBadge(p.payment_status ?? "pending"),
            className: "whitespace-nowrap",
        },
        {
            key: "actions",
            header: "Actions",
            headerClassName: "text-right",
            render: (p) => (
                <div className="flex justify-end gap-3">
                    <PermissionGuard permission={PERMISSIONS.PAYROLLS.VIEW}>
                        <Link
                            href={`/dashboard/payrolls/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.PAYROLLS.EDIT}>
                        <Link
                            href={`/dashboard/payrolls/${p.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                    {p.payment_status !== "paid" && (
                        <PermissionButton
                            permission={PERMISSIONS.PAYROLLS.CREATE_PAYMENT}
                            onClick={() => handlePay(p.id)}
                            disabled={payingId === p.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-md disabled:opacity-50 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v5.576m-3.414 1a2 2 0 11-2.828 2.828 2.828 0 012.828 2.828" />
                            </svg>
                            {payingId === p.id ? "Paying…" : "Pay"}
                        </PermissionButton>
                    )}
                    <PermissionButton
                        permission={PERMISSIONS.PAYROLLS.DELETE}
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                    </PermissionButton>
                </div>
            ),
            className: "whitespace-nowrap text-right",
        },
    ];

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Payrolls"
                description="Manage payroll records"
                action={
                    <div className="flex flex-wrap items-center gap-3">
                        <PermissionGuard permission={PERMISSIONS.PAYROLLS.CREATE}>
                            <Link
                                href="/dashboard/payrolls/new"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create payroll
                            </Link>
                        </PermissionGuard>
                        <PermissionButton
                            permission={PERMISSIONS.PAYROLLS.VIEW_ALL}
                            onClick={handleProcessPayroll}
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                        >
                            {processing ? "Processing…" : "Process Payroll"}
                        </PermissionButton>
                    </div>
                }
            />
            {processSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                    {processSuccess}
                </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Year</label>
                                <select
                                    value={effectiveYear === "" ? "" : effectiveYear}
                                    onChange={(e) => setYearFilter(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All</option>
                                    {YEAR_OPTIONS.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Month</label>
                                <select
                                    value={effectiveMonth}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m.value || "all"} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search payrolls..." />
                        <SortButtons options={sortOptions} sortBy={sortBy as SortField} sortOrder={sortOrder} onSort={(f) => handleSort(f as string)} />
                    </div>
                </div>
                {isLoading && payrolls.length === 0 ? (
                    <LoadingSkeleton rows={10} />
                ) : error && payrolls.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Retry
                        </button>
                    </div>
                ) : payrolls.length === 0 ? (
                    <EmptyState
                        title="No payrolls"
                        description={searchQuery || yearFilter || monthFilter ? "No records match the filters." : "Create a payroll or use Process Payroll."}
                        action={
                            !searchQuery && !yearFilter && !monthFilter ? (
                                <PermissionGuard permission={PERMISSIONS.PAYROLLS.CREATE}>
                                    <Link href="/dashboard/payrolls/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        Create payroll
                                    </Link>
                                </PermissionGuard>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <DataTable data={payrolls} columns={columns} rowKey={(p) => `payroll-${p.id}`} striped />
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            isLoading={isLoading}
                            itemName="payrolls"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
