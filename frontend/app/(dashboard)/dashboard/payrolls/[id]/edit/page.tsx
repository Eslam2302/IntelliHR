"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPayroll, updatePayroll } from "@/services/api/payrolls";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Payroll } from "@/lib/types/payroll";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { UpdatePayrollData } from "@/services/api/payrolls";

const PAYMENT_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
];

export default function EditPayrollPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: payroll, isLoading } = useEntity<Payroll>({
        fetchFunction: getPayroll,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Payroll, UpdatePayrollData, UpdatePayrollData>({
        initialData: {
            basic_salary: 0,
            total_allowances: 0,
            total_deductions: 0,
            payment_status: "pending",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updatePayroll(entityId, {
                basic_salary: data.basic_salary != null ? Number(data.basic_salary) : undefined,
                total_allowances: data.total_allowances != null ? Number(data.total_allowances) : undefined,
                total_deductions: data.total_deductions != null ? Number(data.total_deductions) : undefined,
                payment_status: data.payment_status?.trim(),
            });
            return res as unknown as { data: Payroll };
        },
        onSuccess: () => router.push(`/dashboard/payrolls/${id}`),
        validate: (data) => {
            if (data.basic_salary != null && data.basic_salary !== "") {
                const sal = Number(data.basic_salary);
                if (isNaN(sal) || sal < 0) return "Basic salary must be a valid non-negative number";
            }
            return null;
        },
    });

    useEffect(() => {
        if (payroll) {
            setFormData({
                basic_salary: payroll.basic_salary ?? 0,
                total_allowances: payroll.total_allowances ?? 0,
                total_deductions: payroll.total_deductions ?? 0,
                payment_status: payroll.payment_status ?? "pending",
            });
        }
    }, [payroll, setFormData]);

    if (isLoading && !payroll) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!payroll) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.PAYROLLS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit payroll</h1>
                    <p className="text-gray-600 mt-1">
                        {getEmployeeDisplayLabel(payroll.employee, payroll.employee_id)} – {payroll.year}/{String(payroll.month).padStart(2, "0")}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Employee"
                            name="employee"
                            type="text"
                            value={getEmployeeDisplayLabel(payroll.employee, payroll.employee_id)}
                            onChange={() => {}}
                            disabled
                        />
                        <FormField
                            label="Period"
                            name="period"
                            type="text"
                            value={`${payroll.year} / ${String(payroll.month).padStart(2, "0")}`}
                            onChange={() => {}}
                            disabled
                        />
                    </div>
                    <FormField
                        label="Basic salary"
                        name="basic_salary"
                        type="number"
                        value={formData.basic_salary ?? ""}
                        onChange={(e) => updateField("basic_salary", e.target.value)}
                        required
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Total allowances"
                        name="total_allowances"
                        type="number"
                        value={formData.total_allowances ?? ""}
                        onChange={(e) => updateField("total_allowances", e.target.value)}
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Total deductions"
                        name="total_deductions"
                        type="number"
                        value={formData.total_deductions ?? ""}
                        onChange={(e) => updateField("total_deductions", e.target.value)}
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Payment status"
                        name="payment_status"
                        type="select"
                        value={formData.payment_status ?? "pending"}
                        onChange={(e) => updateField("payment_status", e.target.value)}
                        options={PAYMENT_STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Update payroll" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
