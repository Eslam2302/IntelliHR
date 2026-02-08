"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompetency } from "@/services/api/competencies";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Competency } from "@/lib/types/competency";
import type { CreateCompetencyData } from "@/services/api/competencies";

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

export default function NewCompetencyPage() {
    const router = useRouter();
    const [ratingDescriptors, setRatingDescriptors] = useState<Record<number, string>>({
        1: "",
        2: "",
        3: "",
        4: "",
        5: "",
    });

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Competency, CreateCompetencyData, CreateCompetencyData>({
        initialData: {
            name: "",
            description: "",
            category: "technical",
            applicable_to: "all",
            rating_descriptors: { 1: "", 2: "", 3: "", 4: "", 5: "" },
            weight: 1,
            is_active: true,
            display_order: 0,
        },
        createFunction: async (data) => {
            // Ensure rating_descriptors has all 5 keys
            const descriptors: Record<number, string> = {};
            for (let i = 1; i <= 5; i++) {
                const value = ratingDescriptors[i]?.trim();
                if (!value) {
                    throw new Error(`Rating descriptor for level ${i} is required`);
                }
                descriptors[i] = value;
            }
            
            const res = await createCompetency({
                name: data.name!.trim(),
                description: data.description!.trim(),
                category: data.category!,
                applicable_to: data.applicable_to!,
                rating_descriptors: descriptors,
                weight: Number(data.weight)!,
                is_active: data.is_active ?? true,
                display_order: data.display_order ? Number(data.display_order) : 0,
            });
            return res as unknown as { data: Competency };
        },
        onSuccess: () => router.push("/dashboard/competencies"),
        validate: (data) => {
            if (!data.name?.trim()) return "Name is required";
            if (!data.description?.trim()) return "Description is required";
            if (!data.category) return "Category is required";
            if (!data.applicable_to) return "Applicable to is required";
            if (!data.weight || Number(data.weight) < 1 || Number(data.weight) > 10) return "Weight must be between 1 and 10";
            // Validate rating descriptors
            for (let i = 1; i <= 5; i++) {
                if (!ratingDescriptors[i]?.trim()) {
                    return `Rating descriptor for level ${i} is required`;
                }
            }
            return null;
        },
    });

    return (
        <ProtectedPage permission={PERMISSIONS.COMPETENCIES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create competency</h1>
                    <p className="text-gray-600 mt-1">Add a new performance competency</p>
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
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Applicable To"
                            name="applicable_to"
                            type="select"
                            value={formData.applicable_to ?? ""}
                            onChange={(e) => updateField("applicable_to", e.target.value)}
                            options={APPLICABLE_TO_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Rating Descriptors <span className="text-red-500">*</span>
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
                                    required
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
                            required
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
                        value={formData.is_active ?? true}
                        checked={formData.is_active ?? true}
                        onChange={(e) => updateField("is_active", (e.target as HTMLInputElement).checked)}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Create competency" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
