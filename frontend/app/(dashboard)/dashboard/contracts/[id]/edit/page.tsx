"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getContract, updateContract } from "@/services/api/contracts";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Contract } from "@/lib/types/contract";
import type { UpdateContractData } from "@/services/api/contracts";

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

export default function EditContractPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: contract, isLoading } = useEntity<Contract>({
        fetchFunction: getContract,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Contract, UpdateContractData, UpdateContractData>({
        initialData: {
            end_date: "",
            contract_type: "",
            salary: 0,
            terms: "",
            probation_period_days: 90,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateContract(entityId, {
                end_date: data.end_date?.trim() || undefined,
                contract_type: data.contract_type?.trim() || undefined,
                salary: data.salary != null ? Number(data.salary) : undefined,
                terms: data.terms?.trim() || undefined,
                probation_period_days: data.probation_period_days != null ? Number(data.probation_period_days) : undefined,
            });
            return res as unknown as { data: Contract };
        },
        onSuccess: () => router.push(`/dashboard/contracts/${id}`),
        validate: (data) => {
            if (data.salary != null && data.salary !== "") {
                const sal = Number(data.salary);
                if (isNaN(sal) || sal < 0) return "Salary must be a valid positive number";
            }
            return null;
        },
    });

    useEffect(() => {
        if (contract) {
            setFormData({
                end_date: contract.end_date ?? "",
                contract_type: contract.contract_type ?? "",
                salary: contract.salary ?? 0,
                terms: contract.terms ?? "",
                probation_period_days: contract.probation_period_days ?? 90,
            });
        }
    }, [contract, setFormData]);

    if (isLoading && !contract) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!contract) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.CONTRACTS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit contract</h1>
                    <p className="text-gray-600 mt-1">
                        {contract.employee?.name ?? `Employee #${contract.employee_id}`}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Start date"
                            name="start_date"
                            type="date"
                            value={contract.start_date ?? ""}
                            onChange={() => {}}
                            disabled
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
                        label="Contract type"
                        name="contract_type"
                        type="select"
                        value={formData.contract_type ?? ""}
                        onChange={(e) => updateField("contract_type", e.target.value)}
                        options={CONTRACT_TYPES}
                        required
                        disabled={isSubmitting}
                    />
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
                    <ActionButtons submitLabel="Update contract" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
