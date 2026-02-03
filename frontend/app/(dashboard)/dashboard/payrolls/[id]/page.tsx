"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getPayroll, payPayroll } from "@/services/api/payrolls";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PermissionButton } from "@/components/common/PermissionButton";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Payroll } from "@/lib/types/payroll";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

const STRIPE_TEST_TOKEN =
    process.env.NEXT_PUBLIC_STRIPE_TEST_TOKEN ||
    (process.env.NODE_ENV === "development" ? "tok_visa" : "");

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

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

export default function PayrollViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const [paying, setPaying] = useState(false);
    const { data: payroll, isLoading, error, refetch } = useEntity<Payroll>({
        fetchFunction: getPayroll,
        entityId: id,
    });

    const handlePay = async () => {
        if (!STRIPE_TEST_TOKEN) {
            alert("Stripe test token is not configured. Set NEXT_PUBLIC_STRIPE_TEST_TOKEN.");
            return;
        }
        if (!confirm("Pay this payroll using the configured Stripe test token?")) return;
        try {
            setPaying(true);
            await payPayroll(id, STRIPE_TEST_TOKEN);
            await refetch();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Payment failed");
        } finally {
            setPaying(false);
        }
    };

    if (isLoading && !payroll) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !payroll) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/payrolls" className="text-indigo-600 hover:underline">
                    Back to payrolls
                </Link>
            </div>
        );
    }

    if (!payroll) return null;

    const fmt = (n: number | null | undefined) => n != null ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(n) : "—";

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Payroll #${payroll.id}`}
                description={getEmployeeDisplayLabel(payroll.employee, payroll.employee_id)}
                action={
                    <div className="flex flex-wrap items-center gap-3">
                        {payroll.payment_status !== "paid" && (
                            <PermissionButton
                                permission={PERMISSIONS.PAYROLLS.CREATE_PAYMENT}
                                onClick={handlePay}
                                disabled={paying}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v5.576m-3.414 1a2 2 0 11-2.828 2.828 2.828 0 012.828 2.828" />
                                </svg>
                                {paying ? "Paying…" : "Pay"}
                            </PermissionButton>
                        )}
                        <PermissionGuard permission={PERMISSIONS.PAYROLLS.EDIT}>
                            <Link
                                href={`/dashboard/payrolls/${payroll.id}/edit`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </PermissionGuard>
                    </div>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Employee"
                            value={
                                payroll.employee_id ? (
                                    <Link href={`/dashboard/employees/${payroll.employee_id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(payroll.employee, payroll.employee_id)}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Period" value={`${payroll.year} / ${String(payroll.month).padStart(2, "0")}`} />
                        <DetailRow label="Basic salary" value={fmt(payroll.basic_salary)} />
                        <DetailRow label="Total allowances" value={fmt(payroll.total_allowances)} />
                        <DetailRow label="Total deductions" value={fmt(payroll.total_deductions)} />
                        <DetailRow label="Net pay" value={fmt(payroll.net_pay)} />
                        <DetailRow label="Payment status" value={paymentStatusBadge(payroll.payment_status ?? "pending")} />
                        <DetailRow
                            label="Processed at"
                            value={payroll.processed_at ? new Date(payroll.processed_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Paid at"
                            value={payroll.paid_at ? new Date(payroll.paid_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Created"
                            value={payroll.created_at ? new Date(payroll.created_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Updated"
                            value={payroll.updated_at ? new Date(payroll.updated_at).toLocaleString() : null}
                        />
                    </dl>
                </div>
            </div>
        </div>
    );
}
