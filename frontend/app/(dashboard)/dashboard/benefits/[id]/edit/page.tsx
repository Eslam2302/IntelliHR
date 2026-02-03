"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBenefit, updateBenefit } from "@/services/api/benefits";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Benefit } from "@/lib/types/benefit";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { UpdateBenefitData } from "@/services/api/benefits";

const isDeductionOptions = [
    { value: "false", label: "No (benefit)" },
    { value: "true", label: "Yes (deduction)" },
];

export default function EditBenefitPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: benefit, isLoading } = useEntity<Benefit>({
        fetchFunction: getBenefit,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Benefit, UpdateBenefitData, UpdateBenefitData>({
        initialData: {
            benefit_type: "",
            amount: 0,
            is_deduction: false,
            start_date: "",
            end_date: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateBenefit(entityId, {
                benefit_type: data.benefit_type?.trim(),
                amount: data.amount != null ? Number(data.amount) : undefined,
                is_deduction: data.is_deduction,
                start_date: data.start_date?.trim(),
                end_date: data.end_date?.trim() || undefined,
            });
            return res as unknown as { data: Benefit };
        },
        onSuccess: () => router.push(`/dashboard/benefits/${id}`),
        validate: (data) => {
            if (data.amount != null && data.amount !== "") {
                const amt = Number(data.amount);
                if (isNaN(amt) || amt < 0) return "Amount must be a valid non-negative number";
            }
            return null;
        },
    });

    useEffect(() => {
        if (benefit) {
            setFormData({
                benefit_type: benefit.benefit_type ?? "",
                amount: benefit.amount ?? 0,
                is_deduction: benefit.is_deduction ?? false,
                start_date: benefit.start_date ?? "",
                end_date: benefit.end_date ?? "",
            });
        }
    }, [benefit, setFormData]);

    if (isLoading && !benefit) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!benefit) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.BENEFITS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit benefit</h1>
                    <p className="text-gray-600 mt-1">
                        {getEmployeeDisplayLabel(benefit.employee, benefit.employee_id)} – {benefit.benefit_type}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Benefit type"
                        name="benefit_type"
                        type="text"
                        value={formData.benefit_type ?? ""}
                        onChange={(e) => updateField("benefit_type", e.target.value)}
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
                    <FormField
                        label="Is deduction"
                        name="is_deduction"
                        type="select"
                        value={String(formData.is_deduction ?? false)}
                        onChange={(e) => updateField("is_deduction", e.target.value === "true")}
                        options={isDeductionOptions}
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Start date"
                            name="start_date"
                            type="date"
                            value={formData.start_date ?? ""}
                            onChange={(e) => updateField("start_date", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="End date"
                            name="end_date"
                            type="date"
                            value={formData.end_date ?? ""}
                            onChange={(e) => updateField("end_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <ActionButtons submitLabel="Update benefit" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
