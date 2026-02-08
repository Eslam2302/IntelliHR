"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAsset, updateAsset } from "@/services/api/assets";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Asset } from "@/lib/types/asset";
import type { UpdateAssetData } from "@/services/api/assets";

const STATUS_OPTIONS = [
    { value: "available", label: "Available" },
    { value: "assigned", label: "Assigned" },
    { value: "maintenance", label: "Maintenance" },
    { value: "retired", label: "Retired" },
];

export default function EditAssetPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const { data: asset, isLoading } = useEntity<Asset>({
        fetchFunction: getAsset,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Asset, UpdateAssetData, UpdateAssetData>({
        initialData: {
            name: "",
            serial_number: "",
            condition: "",
            status: "available",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateAsset(entityId, {
                name: data.name?.trim(),
                serial_number: data.serial_number?.trim(),
                condition: data.condition?.trim() || null,
                status: data.status || null,
            });
            return res as unknown as { data: Asset };
        },
        onSuccess: () => router.push(`/dashboard/assets/${id}`),
        validate: (data) => {
            if (data.name && !data.name.trim()) return "Name is required";
            if (data.serial_number && !data.serial_number.trim()) return "Serial number is required";
            return null;
        },
    });

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name ?? "",
                serial_number: asset.serial_number ?? "",
                condition: asset.condition ?? "",
                status: asset.status ?? "available",
            });
        }
    }, [asset, setFormData]);

    if (isLoading && !asset) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!asset) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.ASSETS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit asset</h1>
                    <p className="text-gray-600 mt-1">{asset.name}</p>
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
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Status"
                            name="status"
                            type="select"
                            value={formData.status ?? ""}
                            onChange={(e) => updateField("status", e.target.value)}
                            options={STATUS_OPTIONS}
                            disabled={isSubmitting}
                        />
                    </div>
                    <ActionButtons submitLabel="Update asset" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
