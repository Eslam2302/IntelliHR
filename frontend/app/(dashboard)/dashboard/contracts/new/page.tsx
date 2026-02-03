"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/services/api/contracts";
import { getEmployees } from "@/services/api/employees";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Contract } from "@/lib/types/contract";
import type { CreateContractData } from "@/services/api/contracts";
import type { Employee } from "@/lib/types/employee";

const CONTRACT_TYPES = [
    { value: "permanent", label: "Permanent" },
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "fixed_term", label: "Fixed term" },
    { value: "temporary", label: "Temporary" },
    { value: "probation", label: "Probation" },
    { value: "internship", label: "Internship" },
    { value: "consultant", label: "Consultant" },
    { value: "contractor", label: "Contractor" },
    { value: "freelance", label: "Freelance" },
    { value: "project_based", label: "Project based" },
    { value: "seasonal", label: "Seasonal" },
    { value: "hourly", label: "Hourly" },
    { value: "commission_based", label: "Commission based" },
    { value: "on_call", label: "On call" },
];

export default function NewContractPage() {
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
    } = useEntityForm<Contract, CreateContractData, CreateContractData>({
        initialData: {
            employee_id: undefined as unknown as number,
            start_date: "",
            end_date: "",
            contract_type: "",
            salary: 0,
            terms: "",
            probation_period_days: 90,
        },
        createFunction: async (data) => {
            const res = await createContract({
                employee_id: Number(data.employee_id)!,
                start_date: data.start_date!,
                end_date: data.end_date?.trim() || undefined,
                contract_type: data.contract_type!,
                salary: Number(data.salary)!,
                terms: data.terms?.trim() || undefined,
                probation_period_days: data.probation_period_days != null ? Number(data.probation_period_days) : undefined,
            });
            return res as unknown as { data: Contract };
        },
        onSuccess: () => router.push("/dashboard/contracts"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.start_date?.trim()) return "Start date is required";
            if (!data.contract_type?.trim()) return "Contract type is required";
            if (data.salary == null || data.salary === "") return "Salary is required";
            const sal = Number(data.salary);
            if (isNaN(sal) || sal < 0) return "Salary must be a valid positive number";
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

    return (
        <ProtectedPage permission={PERMISSIONS.CONTRACTS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create contract</h1>
                    <p className="text-gray-600 mt-1">Add a new contract</p>
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
                        label="Contract type"
                        name="contract_type"
                        type="select"
                        value={formData.contract_type ?? ""}
                        onChange={(e) => updateField("contract_type", e.target.value)}
                        options={CONTRACT_TYPES}
                        required
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
                    <FormField
                        label="Salary"
                        name="salary"
                        type="number"
                        value={formData.salary ?? ""}
                        onChange={(e) => updateField("salary", e.target.value)}
                        required
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Probation period (days)"
                        name="probation_period_days"
                        type="number"
                        value={formData.probation_period_days ?? ""}
                        onChange={(e) => updateField("probation_period_days", e.target.value)}
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Terms"
                        name="terms"
                        type="textarea"
                        value={formData.terms ?? ""}
                        onChange={(e) => updateField("terms", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <ActionButtons submitLabel="Create contract" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
