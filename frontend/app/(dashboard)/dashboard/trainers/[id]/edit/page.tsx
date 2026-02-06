"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getTrainer, updateTrainer } from "@/services/api/trainers";
import { getEmployees } from "@/services/api/employees";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Trainer } from "@/lib/types/trainer";
import type { UpdateTrainerData } from "@/services/api/trainers";
import type { Employee } from "@/lib/types/employee";

const TRAINER_TYPES = [
    { value: "internal", label: "Internal (employee)" },
    { value: "external", label: "External" },
];

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function EditTrainerPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseId(params.id);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" })
            .then((r) => setEmployees(r.data))
            .catch(() => setEmployees([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: trainer, isLoading } = useEntity<Trainer>({
        fetchFunction: getTrainer,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Trainer, UpdateTrainerData, UpdateTrainerData>({
        initialData: {
            type: "internal",
            employee_id: undefined as unknown as number,
            name: "",
            email: "",
            phone: "",
            company: "",
        },
        entityId: id ?? undefined,
        updateFunction: async (entityId, data) => {
            const res = await updateTrainer(entityId, {
                type: data.type ?? undefined,
                employee_id: data.type === "internal" && data.employee_id != null ? Number(data.employee_id) : null,
                name: data.type === "external" ? (data.name?.trim() || null) : null,
                email: data.type === "external" ? (data.email?.trim() || null) : null,
                phone: data.type === "external" ? (data.phone?.trim() || null) : null,
                company: data.type === "external" ? (data.company?.trim() || null) : null,
            });
            return res as unknown as { data: Trainer };
        },
        onSuccess: () => id != null && router.push(`/dashboard/trainers/${id}`),
        validate: (data) => {
            if (data.type === "internal" && !data.employee_id) return "Employee is required for internal trainer";
            if (data.type === "external" && !data.name?.trim()) return "Name is required for external trainer";
            return null;
        },
    });

    useEffect(() => {
        if (trainer) {
            setFormData({
                type: trainer.type ?? "internal",
                employee_id: trainer.employee_id ?? undefined,
                name: trainer.name ?? "",
                email: trainer.email ?? "",
                phone: trainer.phone ?? "",
                company: trainer.company ?? "",
            });
        }
    }, [trainer, setFormData]);

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid trainer ID</p>
                <Link href="/dashboard/trainers" className="text-indigo-600 hover:underline">
                    Back to trainers
                </Link>
            </div>
        );
    }

    if (isLoading && !trainer) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!trainer) return null;

    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: `${e.first_name} ${e.last_name} (${e.work_email ?? "—"})`,
    }));

    const isInternal = formData.type === "internal";

    return (
        <ProtectedPage permission={PERMISSIONS.TRAINERS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit trainer</h1>
                    <p className="text-gray-600 mt-1">Trainer #{trainer.id}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Type"
                        name="type"
                        type="select"
                        value={formData.type ?? ""}
                        onChange={(e) => updateField("type", e.target.value)}
                        options={TRAINER_TYPES}
                        required
                        disabled={isSubmitting}
                    />
                    {isInternal ? (
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
                    ) : (
                        <>
                            <FormField
                                label="Name"
                                name="name"
                                type="text"
                                value={formData.name ?? ""}
                                onChange={(e) => updateField("name", e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email ?? ""}
                                onChange={(e) => updateField("email", e.target.value)}
                                disabled={isSubmitting}
                            />
                            <FormField
                                label="Phone"
                                name="phone"
                                type="text"
                                value={formData.phone ?? ""}
                                onChange={(e) => updateField("phone", e.target.value)}
                                disabled={isSubmitting}
                            />
                            <FormField
                                label="Company"
                                name="company"
                                type="text"
                                value={formData.company ?? ""}
                                onChange={(e) => updateField("company", e.target.value)}
                                disabled={isSubmitting}
                            />
                        </>
                    )}
                    <ActionButtons submitLabel="Update trainer" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
