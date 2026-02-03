"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllowance, updateAllowance } from "@/services/api/allowances";
import { getPayrolls } from "@/services/api/payrolls";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Allowance } from "@/lib/types/allowance";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { UpdateAllowanceData } from "@/services/api/allowances";
import type { Payroll } from "@/lib/types/payroll";

export default function EditAllowancePage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);

    const { data: allowance, isLoading } = useEntity<Allowance>({
        fetchFunction: getAllowance,
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
    } = useEntityForm<Allowance, UpdateAllowanceData, UpdateAllowanceData>({
        initialData: {
            payroll_id: null,
            type: "",
            amount: 0,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateAllowance(entityId, {
                payroll_id: data.payroll_id != null && data.payroll_id !== "" ? Number(data.payroll_id) : undefined,
                type: data.type?.trim(),
                amount: data.amount != null ? Number(data.amount) : undefined,
            });
            return res as unknown as { data: Allowance };
        },
        onSuccess: () => router.push(`/dashboard/allowances/${id}`),
        validate: (data) => {
            if (data.amount != null && data.amount !== "") {
                const amt = Number(data.amount);
                if (isNaN(amt) || amt < 0) return "Amount must be a valid non-negative number";
            }
            return null;
        },
    });

    useEffect(() => {
        if (allowance) {
            setFormData({
                payroll_id: allowance.payroll_id ?? null,
                type: allowance.type ?? "",
                amount: allowance.amount ?? 0,
            });
        }
    }, [allowance, setFormData]);

    if (isLoading && !allowance) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!allowance) return null;

    const payrollOptions = [
        { value: "", label: "None (general allowance)" },
        ...payrolls.map((p) => ({
            value: p.id,
            label: `${getEmployeeDisplayLabel(p.employee, p.employee_id)} – ${p.year}/${String(p.month).padStart(2, "0")}`,
        })),
    ];

    return (
        <ProtectedPage permission={PERMISSIONS.ALLOWANCES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit allowance</h1>
                    <p className="text-gray-600 mt-1">
                        {getEmployeeDisplayLabel(allowance.employee, allowance.employee_id)} – {allowance.type}
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
                    <ActionButtons submitLabel="Update allowance" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
