"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCompetency, updateCompetency } from "@/services/api/competencies";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Competency } from "@/lib/types/competency";
import type { UpdateCompetencyData } from "@/services/api/competencies";

const CATEGORY_OPTIONS = [
    { value: "technical", label: "Technical" },
    { value: "behavioral", label: "Behavioral" },
    { value: "leadership", label: "Leadership" },
    { value: "core_values", label: "Core Values" },
];

const APPLICABLE_TO_OPTIONS = [
    { value: "all", label: "All" },
    { value: "individual_contributor", label: "Individual Contributor" },
    { value: "manager", label: "Manager" },
    { value: "senior_manager", label: "Senior Manager" },
    { value: "executive", label: "Executive" },
];

export default function EditCompetencyPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [ratingDescriptors, setRatingDescriptors] = useState<Record<number, string>>({
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
    });

    const { data: competency, isLoading } = useEntity<Competency>({
        fetchFunction: getCompetency,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Competency, UpdateCompetencyData, UpdateCompetencyData>({
        initialData: {
            name: "",
            description: "",
            category: "technical",
            applicable_to: "all",
            rating_descriptors: null,
            weight: 1,
            is_active: true,
            display_order: 0,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            // Ensure rating_descriptors has all 5 keys if provided
            let descriptors = data.rating_descriptors;
            if (!descriptors && ratingDescriptors) {
                descriptors = {};
                for (let i = 1; i <= 5; i++) {
                    if (ratingDescriptors[i]?.trim()) {
                        descriptors[i] = ratingDescriptors[i].trim();
                    }
                }
            }
            
            const res = await updateCompetency(entityId, {
                name: data.name?.trim(),
                description: data.description?.trim(),
                category: data.category,
                applicable_to: data.applicable_to,
                rating_descriptors: descriptors || null,
                weight: data.weight ? Number(data.weight) : undefined,
                is_active: data.is_active,
                display_order: data.display_order ? Number(data.display_order) : undefined,
            });
            return res as unknown as { data: Competency };
        },
        onSuccess: () => router.push(`/dashboard/competencies/${id}`),
        validate: (data) => {
            if (data.name && !data.name.trim()) return "Name is required";
            if (data.description && !data.description.trim()) return "Description is required";
            if (data.weight && (Number(data.weight) < 1 || Number(data.weight) > 10)) return "Weight must be between 1 and 10";
            return null;
        },
    });

    useEffect(() => {
        if (competency) {
            setFormData({
                name: competency.name ?? "",
                description: competency.description ?? "",
                category: competency.category ?? "technical",
                applicable_to: competency.applicable_to ?? "all",
                rating_descriptors: competency.rating_descriptors ?? null,
                weight: competency.weight ?? 1,
                is_active: competency.is_active ?? true,
                display_order: competency.display_order ?? 0,
            });
            
            // Load rating descriptors
            if (competency.rating_descriptors) {
                if (typeof competency.rating_descriptors === 'object' && !Array.isArray(competency.rating_descriptors)) {
                    const descs: Record<number, string> = {};
                    for (let i = 1; i <= 5; i++) {
                        descs[i] = (competency.rating_descriptors as any)[i] || (competency.rating_descriptors as any)[String(i)] || "";
                    }
                    setRatingDescriptors(descs);
                }
            }
        }
    }, [competency, setFormData]);

    if (isLoading && !competency) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!competency) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.COMPETENCIES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit competency</h1>
                    <p className="text-gray-600 mt-1">{competency.name}</p>
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
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description ?? ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        required
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Category"
                            name="category"
                            type="select"
                            value={formData.category ?? ""}
                            onChange={(e) => updateField("category", e.target.value)}
                            options={CATEGORY_OPTIONS}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Applicable To"
                            name="applicable_to"
                            type="select"
                            value={formData.applicable_to ?? ""}
                            onChange={(e) => updateField("applicable_to", e.target.value)}
                            options={APPLICABLE_TO_OPTIONS}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Rating Descriptors
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Provide descriptions for each rating level (1-5)</p>
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div key={level}>
                                <FormField
                                    label={`Level ${level} Description`}
                                    name={`rating_descriptor_${level}`}
                                    type="text"
                                    value={ratingDescriptors[level] ?? ""}
                                    onChange={(e) => setRatingDescriptors({ ...ratingDescriptors, [level]: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Weight"
                            name="weight"
                            type="number"
                            value={formData.weight ?? 1}
                            onChange={(e) => updateField("weight", e.target.value)}
                            disabled={isSubmitting}
                            min={1}
                            max={10}
                        />
                        <FormField
                            label="Display Order"
                            name="display_order"
                            type="number"
                            value={formData.display_order ?? 0}
                            onChange={(e) => updateField("display_order", e.target.value || 0)}
                            disabled={isSubmitting}
                            min={0}
                        />
                    </div>
                    <FormField
                        label="Active"
                        name="is_active"
                        type="checkbox"
                        checked={formData.is_active ?? true}
                        onChange={(e) => updateField("is_active", e.target.checked)}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Update competency" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
