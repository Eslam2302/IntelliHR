"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAsset } from "@/services/api/assets";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Asset } from "@/lib/types/asset";
import type { CreateAssetData } from "@/services/api/assets";

const STATUS_OPTIONS = [
    { value: "available", label: "Available" },
    { value: "assigned", label: "Assigned" },
    { value: "maintenance", label: "Maintenance" },
    { value: "retired", label: "Retired" },
];

export default function NewAssetPage() {
    const router = useRouter();

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Asset, CreateAssetData, CreateAssetData>({
        initialData: {
            name: "",
            serial_number: "",
            condition: "",
            status: "available",
        },
        createFunction: async (data) => {
            const res = await createAsset({
                name: data.name!,
                serial_number: data.serial_number!,
                condition: data.condition?.trim() || null,
                status: data.status!,
            });
            return res as unknown as { data: Asset };
        },
        onSuccess: () => router.push("/dashboard/assets"),
        validate: (data) => {
            if (!data.name?.trim()) return "Name is required";
            if (!data.serial_number?.trim()) return "Serial number is required";
            if (!data.condition?.trim()) return "Condition is required";
            if (!data.status) return "Status is required";
            return null;
        },
    });

    return (
        <ProtectedPage permission={PERMISSIONS.ASSETS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create asset</h1>
                    <p className="text-gray-600 mt-1">Add a new company asset</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
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
                        label="Serial number"
                        name="serial_number"
                        type="text"
                        value={formData.serial_number ?? ""}
                        onChange={(e) => updateField("serial_number", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Condition"
                            name="condition"
                            type="text"
                            value={formData.condition ?? ""}
                            onChange={(e) => updateField("condition", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Status"
                            name="status"
                            type="select"
                            value={formData.status ?? ""}
                            onChange={(e) => updateField("status", e.target.value)}
                            options={STATUS_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <ActionButtons submitLabel="Create asset" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
