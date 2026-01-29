"use client";

import { useRouter } from "next/navigation";
import { createLeaveType } from "@/services/api/leave-types";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { LeaveType } from "@/lib/types/leave-type";
import type { CreateLeaveTypeData } from "@/services/api/leave-types";

const ACCRUAL_OPTIONS = [
    { value: "none", label: "None" },
    { value: "monthly", label: "Monthly" },
    { value: "annual", label: "Annual" },
];

const PAYMENT_OPTIONS = [
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "partially_paid", label: "Partially paid" },
];

const BOOL_OPTIONS = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
];

function toBool(v: unknown): boolean {
    return v === true || v === "true";
}

export default function NewLeaveTypePage() {
    const router = useRouter();

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<LeaveType, CreateLeaveTypeData, CreateLeaveTypeData>({
        initialData: {
            name: "",
            code: "",
            annual_entitlement: 0,
            accrual_policy: "none",
            carry_over_limit: 0,
            min_request_days: 1,
            max_request_days: 30,
            requires_hr_approval: false,
            requires_attachment: false,
            payment_type: "paid",
            is_active: true,
        },
        createFunction: async (data) => {
            return createLeaveType({
                name: data.name!.trim(),
                code: data.code!.trim(),
                annual_entitlement: Number(data.annual_entitlement) ?? 0,
                accrual_policy: (data.accrual_policy as CreateLeaveTypeData["accrual_policy"]) ?? "none",
                carry_over_limit: Number(data.carry_over_limit) ?? 0,
                min_request_days: Number(data.min_request_days) ?? 1,
                max_request_days: Number(data.max_request_days) ?? 30,
                requires_hr_approval: toBool(data.requires_hr_approval),
                requires_attachment: toBool(data.requires_attachment),
                payment_type: (data.payment_type as CreateLeaveTypeData["payment_type"]) ?? "paid",
                is_active: toBool(data.is_active),
            });
        },
        onSuccess: () => router.push("/dashboard/leave-types"),
        validate: (data) => {
            if (!data.name?.trim()) return "Name is required";
            if (!data.code?.trim()) return "Code is required";
            const minD = Number(data.min_request_days);
            const maxD = Number(data.max_request_days);
            if (isNaN(minD) || minD < 1) return "Min request days must be ≥ 1";
            if (isNaN(maxD) || maxD < 1) return "Max request days must be ≥ 1";
            if (maxD < minD) return "Max request days must be ≥ min request days";
            return null;
        },
    });

    return (
        <ProtectedPage permission={PERMISSIONS.LEAVE_TYPES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create leave type</h1>
                    <p className="text-gray-600 mt-1">Add a new leave type</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Name"
                            name="name"
                            type="text"
                            value={formData.name ?? ""}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="e.g. Annual Leave"
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Code"
                            name="code"
                            type="text"
                            value={formData.code ?? ""}
                            onChange={(e) => updateField("code", e.target.value)}
                            placeholder="e.g. AL"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            label="Annual entitlement (days)"
                            name="annual_entitlement"
                            type="number"
                            value={formData.annual_entitlement ?? 0}
                            onChange={(e) => updateField("annual_entitlement", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Carry over limit (days)"
                            name="carry_over_limit"
                            type="number"
                            value={formData.carry_over_limit ?? 0}
                            onChange={(e) => updateField("carry_over_limit", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Accrual policy"
                            name="accrual_policy"
                            type="select"
                            value={formData.accrual_policy ?? "none"}
                            onChange={(e) => updateField("accrual_policy", e.target.value)}
                            options={ACCRUAL_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Min request days"
                            name="min_request_days"
                            type="number"
                            value={formData.min_request_days ?? 1}
                            onChange={(e) => updateField("min_request_days", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Max request days"
                            name="max_request_days"
                            type="number"
                            value={formData.max_request_days ?? 30}
                            onChange={(e) => updateField("max_request_days", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            label="Payment type"
                            name="payment_type"
                            type="select"
                            value={formData.payment_type ?? "paid"}
                            onChange={(e) => updateField("payment_type", e.target.value)}
                            options={PAYMENT_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Requires HR approval"
                            name="requires_hr_approval"
                            type="select"
                            value={toBool(formData.requires_hr_approval) ? "true" : "false"}
                            onChange={(e) => updateField("requires_hr_approval", e.target.value)}
                            options={BOOL_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Requires attachment"
                            name="requires_attachment"
                            type="select"
                            value={toBool(formData.requires_attachment) ? "true" : "false"}
                            onChange={(e) => updateField("requires_attachment", e.target.value)}
                            options={BOOL_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Active"
                        name="is_active"
                        type="select"
                        value={toBool(formData.is_active) ? "true" : "false"}
                        onChange={(e) => updateField("is_active", e.target.value)}
                        options={BOOL_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Create leave type" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
