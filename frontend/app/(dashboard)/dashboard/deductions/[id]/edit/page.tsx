"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDeduction, updateDeduction } from "@/services/api/deductions";
import { getPayrolls } from "@/services/api/payrolls";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Deduction } from "@/lib/types/deduction";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { UpdateDeductionData } from "@/services/api/deductions";
import type { Payroll } from "@/lib/types/payroll";

export default function EditDeductionPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);

    const { data: deduction, isLoading } = useEntity<Deduction>({
        fetchFunction: getDeduction,
        entityId: id,
    });

    useEffect(() => {
        getPayrolls({ perPage: 200, sortBy: "created_at", sortOrder: "desc" })
            .then((r) => setPayrolls(r.data))
            .catch(() => setPayrolls([]));
    }, []);

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Deduction, UpdateDeductionData, UpdateDeductionData>({
        initialData: {
            payroll_id: null,
            type: "",
            amount: 0,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateDeduction(entityId, {
                payroll_id: data.payroll_id != null ? Number(data.payroll_id) : undefined,
                type: data.type?.trim(),
                amount: data.amount != null ? Number(data.amount) : undefined,
            });
            return res as unknown as { data: Deduction };
        },
        onSuccess: () => router.push(`/dashboard/deductions/${id}`),
        validate: (data) => {
            if (data.amount != null && data.amount !== "") {
                const amt = Number(data.amount);
                if (isNaN(amt) || amt < 0) return "Amount must be a valid non-negative number";
            }
            return null;
        },
    });

    useEffect(() => {
        if (deduction) {
            setFormData({
                payroll_id: deduction.payroll_id ?? null,
                type: deduction.type ?? "",
                amount: deduction.amount ?? 0,
            });
        }
    }, [deduction, setFormData]);

    if (isLoading && !deduction) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!deduction) return null;

    const payrollOptions = [
        { value: "", label: "None (general deduction)" },
        ...payrolls.map((p) => ({
            value: p.id,
            label: `${getEmployeeDisplayLabel(p.employee, p.employee_id)} – ${p.year}/${String(p.month).padStart(2, "0")}`,
        })),
    ];

    return (
        <ProtectedPage permission={PERMISSIONS.DEDUCTIONS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit deduction</h1>
                    <p className="text-gray-600 mt-1">
                        {getEmployeeDisplayLabel(deduction.employee, deduction.employee_id)} – {deduction.type}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Payroll (optional)"
                        name="payroll_id"
                        type="select"
                        value={formData.payroll_id ?? ""}
                        onChange={(e) => updateField("payroll_id", e.target.value === "" ? null : Number(e.target.value))}
                        options={payrollOptions}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Type"
                        name="type"
                        type="text"
                        value={formData.type ?? ""}
                        onChange={(e) => updateField("type", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount ?? ""}
                        onChange={(e) => updateField("amount", e.target.value)}
                        required
                        disabled={isSubmitting}
                        min={0}
                    />
                    <ActionButtons submitLabel="Update deduction" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
