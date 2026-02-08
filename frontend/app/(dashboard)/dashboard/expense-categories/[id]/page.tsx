"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getExpenseCategory } from "@/services/api/expense-categories";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { ExpenseCategory } from "@/lib/types/expense-category";

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

export default function ExpenseCategoryViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: category, isLoading, error } = useEntity<ExpenseCategory>({
        fetchFunction: getExpenseCategory,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid expense category ID</p>
                <Link href="/dashboard/expense-categories" className="text-indigo-600 hover:underline">
                    Back to expense categories
                </Link>
            </div>
        );
    }

    if (isLoading && !category) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !category) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/expense-categories" className="text-indigo-600 hover:underline">
                    Back to expense categories
                </Link>
            </div>
        );
    }

    if (!category) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={category.name}
                description={`Expense category #${category.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.EXPENSE_CATEGORIES.EDIT}>
                        <Link
                            href={`/dashboard/expense-categories/${category.id}/edit`}
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
                        <DetailRow label="Name" value={category.name} />
                        <DetailRow label="Created" value={category.created_at ? new Date(category.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={category.updated_at ? new Date(category.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
