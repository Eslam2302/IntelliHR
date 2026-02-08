"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getExpense } from "@/services/api/expenses";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { Expense } from "@/lib/types/expense";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

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

export default function ExpenseViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: expense, isLoading, error } = useEntity<Expense>({
        fetchFunction: getExpense,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid expense ID</p>
                <Link href="/dashboard/expenses" className="text-indigo-600 hover:underline">
                    Back to expenses
                </Link>
            </div>
        );
    }

    if (isLoading && !expense) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !expense) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/expenses" className="text-indigo-600 hover:underline">
                    Back to expenses
                </Link>
            </div>
        );
    }

    if (!expense) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Expense #${expense.id}`}
                description={`Amount: $${expense.amount.toFixed(2)}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.EXPENSES.EDIT}>
                        <Link
                            href={`/dashboard/expenses/${expense.id}/edit`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Employee"
                            value={
                                expense.employee ? (
                                    <Link href={`/dashboard/employees/${expense.employee.id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(expense.employee, expense.employee.id)}
                                    </Link>
                                ) : (
                                    expense.employee_id ? `Employee #${expense.employee_id}` : null
                                )
                            }
                        />
                        <DetailRow
                            label="Category"
                            value={
                                expense.category ? (
                                    <Link href={`/dashboard/expense-categories/${expense.category.id}`} className="text-indigo-600 hover:underline">
                                        {expense.category.name}
                                    </Link>
                                ) : (
                                    expense.category_id ? `Category #${expense.category_id}` : null
                                )
                            }
                        />
                        <DetailRow label="Amount" value={`$${expense.amount.toFixed(2)}`} />
                        <DetailRow
                            label="Expense date"
                            value={expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : null}
                        />
                        <DetailRow label="Status" value={statusBadge(expense.status)} />
                        <DetailRow label="Notes" value={expense.notes ? <div className="whitespace-pre-wrap">{expense.notes}</div> : null} />
                        {expense.receipt_path && (
                            <DetailRow
                                label="Receipt"
                                value={
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || ""}/storage/${expense.receipt_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        View receipt
                                    </a>
                                }
                            />
                        )}
                        <DetailRow label="Created" value={expense.created_at ? new Date(expense.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={expense.updated_at ? new Date(expense.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
