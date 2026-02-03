"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBenefit } from "@/services/api/benefits";
import { getEmployees } from "@/services/api/employees";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Benefit } from "@/lib/types/benefit";
import type { CreateBenefitData } from "@/services/api/benefits";
import type { Employee } from "@/lib/types/employee";

export default function NewBenefitPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" })
            .then((r) => setEmployees(r.data))
            .catch(() => setEmployees([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Benefit, CreateBenefitData, CreateBenefitData>({
        initialData: {
            employee_id: undefined as unknown as number,
            benefit_type: "",
            amount: 0,
            is_deduction: false,
            start_date: "",
            end_date: "",
        },
        createFunction: async (data) => {
            const res = await createBenefit({
                employee_id: Number(data.employee_id)!,
                benefit_type: data.benefit_type!,
                amount: Number(data.amount)!,
                is_deduction: Boolean(data.is_deduction),
                start_date: data.start_date!,
                end_date: data.end_date?.trim() || undefined,
            });
            return res as unknown as { data: Benefit };
        },
        onSuccess: () => router.push("/dashboard/benefits"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.benefit_type?.trim()) return "Benefit type is required";
            if (data.amount == null || data.amount === "") return "Amount is required";
            const amt = Number(data.amount);
            if (isNaN(amt) || amt < 0) return "Amount must be a valid non-negative number";
            if (!data.start_date?.trim()) return "Start date is required";
            return null;
        },
    });

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: `${e.first_name} ${e.last_name} (${e.work_email})`,
    }));

    const isDeductionOptions = [
        { value: "false", label: "No (benefit)" },
        { value: "true", label: "Yes (deduction)" },
    ];

    return (
        <ProtectedPage permission={PERMISSIONS.BENEFITS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create benefit</h1>
                    <p className="text-gray-600 mt-1">Add a new benefit</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Employee"
                        name="employee_id"
                        type="select"
                        value={formData.employee_id ?? ""}
                        onChange={(e) => updateField("employee_id", e.target.value)}
                        options={employeeOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Benefit type"
                        name="benefit_type"
                        type="text"
                        value={formData.benefit_type ?? ""}
                        onChange={(e) => updateField("benefit_type", e.target.value)}
                        required
                        disabled={isSubmitting}
                        placeholder="e.g. Health insurance, Housing"
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
                    <ActionButtons submitLabel="Create benefit" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
