"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getLeaveType, updateLeaveType } from "@/services/api/leave-types";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { LeaveType } from "@/lib/types/leave-type";
import type { UpdateLeaveTypeData } from "@/services/api/leave-types";

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

export default function EditLeaveTypePage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const { data: leaveType, isLoading } = useEntity<LeaveType>({ fetchFunction: getLeaveType, entityId: id });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
        setError,
    } = useEntityForm<LeaveType, never, UpdateLeaveTypeData>({
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
        updateFunction: async (leaveId, data) => {
            return updateLeaveType(leaveId, {
                name: data.name?.trim(),
                code: data.code?.trim(),
                annual_entitlement: data.annual_entitlement != null ? Number(data.annual_entitlement) : undefined,
                accrual_policy: data.accrual_policy as UpdateLeaveTypeData["accrual_policy"],
                carry_over_limit: data.carry_over_limit != null ? Number(data.carry_over_limit) : undefined,
                min_request_days: data.min_request_days != null ? Number(data.min_request_days) : undefined,
                max_request_days: data.max_request_days != null ? Number(data.max_request_days) : undefined,
                requires_hr_approval: toBool(data.requires_hr_approval),
                requires_attachment: toBool(data.requires_attachment),
                payment_type: data.payment_type as UpdateLeaveTypeData["payment_type"],
                is_active: toBool(data.is_active),
            });
        },
        entityId: id,
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

    useEffect(() => {
        if (leaveType) {
            setFormData({
                name: leaveType.name ?? "",
                code: leaveType.code ?? "",
                annual_entitlement: leaveType.annual_entitlement ?? 0,
                accrual_policy: leaveType.accrual_policy ?? "none",
                carry_over_limit: leaveType.carry_over_limit ?? 0,
                min_request_days: leaveType.min_request_days ?? 1,
                max_request_days: leaveType.max_request_days ?? 30,
                requires_hr_approval: leaveType.requires_hr_approval ?? false,
                requires_attachment: leaveType.requires_attachment ?? false,
                payment_type: leaveType.payment_type ?? "paid",
                is_active: leaveType.is_active ?? true,
            });
        }
    }, [leaveType, setFormData]);

    useEffect(() => {
        if (leaveType && !isLoading) setError(null);
    }, [leaveType, isLoading, setError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading leave type...</div>
            </div>
        );
    }

    if (!leaveType) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Leave type not found</div>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.LEAVE_TYPES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit leave type</h1>
                    <p className="text-gray-600 mt-1">{leaveType.name}</p>
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
                    <ActionButtons submitLabel="Update leave type" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
