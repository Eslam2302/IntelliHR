"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAllowance } from "@/services/api/allowances";
import { getEmployees } from "@/services/api/employees";
import { getPayrolls } from "@/services/api/payrolls";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Allowance } from "@/lib/types/allowance";
import type { CreateAllowanceData } from "@/services/api/allowances";
import type { Employee } from "@/lib/types/employee";
import type { Payroll } from "@/lib/types/payroll";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

export default function NewAllowancePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }).then((r) => setEmployees(r.data)),
            getPayrolls({ perPage: 200, sortBy: "created_at", sortOrder: "desc" }).then((r) => setPayrolls(r.data)),
        ]).catch(() => {}).finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Allowance, CreateAllowanceData, CreateAllowanceData>({
        initialData: {
            employee_id: undefined as unknown as number,
            payroll_id: null,
            type: "",
            amount: 0,
        },
        createFunction: async (data) => {
            const res = await createAllowance({
                employee_id: Number(data.employee_id)!,
                payroll_id: data.payroll_id != null && data.payroll_id !== "" ? Number(data.payroll_id) : undefined,
                type: data.type!,
                amount: Number(data.amount)!,
            });
            return res as unknown as { data: Allowance };
        },
        onSuccess: () => router.push("/dashboard/allowances"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.type?.trim()) return "Type is required";
            if (data.amount == null || data.amount === "") return "Amount is required";
            const amt = Number(data.amount);
            if (isNaN(amt) || amt < 0) return "Amount must be a valid non-negative number";
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

    const payrollOptions = [
        { value: "", label: "None (general allowance)" },
        ...payrolls.map((p) => ({
            value: p.id,
            label: `${getEmployeeDisplayLabel(p.employee, p.employee_id)} – ${p.year}/${String(p.month).padStart(2, "0")}`,
        })),
    ];

    return (
        <ProtectedPage permission={PERMISSIONS.ALLOWANCES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create allowance</h1>
                    <p className="text-gray-600 mt-1">Add a new allowance</p>
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
                        placeholder="e.g. Housing, Transport"
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
                    <ActionButtons submitLabel="Create allowance" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
