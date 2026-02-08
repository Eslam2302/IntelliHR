"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAssetAssignment, updateAssetAssignment } from "@/services/api/asset-assignments";
import { getAssets } from "@/services/api/assets";
import { getEmployees } from "@/services/api/employees";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { AssetAssignment } from "@/lib/types/asset-assignment";
import type { UpdateAssetAssignmentData } from "@/services/api/asset-assignments";
import type { Asset } from "@/lib/types/asset";
import type { Employee } from "@/lib/types/employee";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

export default function EditAssetAssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getAssets({ perPage: 500, sortBy: "name", sortOrder: "asc" }),
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
        ])
            .then(([assetsRes, employeesRes]) => {
                setAssets(assetsRes.data);
                setEmployees(employeesRes.data);
            })
            .catch(() => {})
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: assignment, isLoading } = useEntity<AssetAssignment>({
        fetchFunction: getAssetAssignment,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<AssetAssignment, UpdateAssetAssignmentData, UpdateAssetAssignmentData>({
        initialData: {
            asset_id: undefined as unknown as number,
            employee_id: undefined as unknown as number,
            assigned_date: "",
            return_date: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateAssetAssignment(entityId, {
                asset_id: data.asset_id ? Number(data.asset_id) : undefined,
                employee_id: data.employee_id ? Number(data.employee_id) : undefined,
                assigned_date: data.assigned_date?.trim() || undefined,
                return_date: data.return_date?.trim() || null,
            });
            return res as unknown as { data: AssetAssignment };
        },
        onSuccess: () => router.push(`/dashboard/asset-assignments/${id}`),
        validate: (data) => {
            if (data.return_date && data.assigned_date && new Date(data.return_date) < new Date(data.assigned_date)) {
                return "Return date must be after or equal to assigned date";
            }
            return null;
        },
    });

    useEffect(() => {
        if (assignment) {
            setFormData({
                asset_id: assignment.asset_id ?? undefined,
                employee_id: assignment.employee_id ?? undefined,
                assigned_date: assignment.assigned_date ? new Date(assignment.assigned_date).toISOString().split("T")[0] : "",
                return_date: assignment.return_date ? new Date(assignment.return_date).toISOString().split("T")[0] : "",
            });
        }
    }, [assignment, setFormData]);

    if (isLoading && !assignment) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!assignment) return null;

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const assetOptions = assets.map((a) => ({ value: a.id, label: `${a.name} (${a.serial_number})` }));
    const employeeOptions = employees.map((e) => ({ value: e.id, label: getEmployeeDisplayLabel(e, e.id) }));

    return (
        <ProtectedPage permission={PERMISSIONS.ASSET_ASSIGNMENTS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit asset assignment</h1>
                    <p className="text-gray-600 mt-1">Assignment #{assignment.id}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Asset"
                            name="asset_id"
                            type="select"
                            value={formData.asset_id ?? ""}
                            onChange={(e) => updateField("asset_id", e.target.value)}
                            options={assetOptions}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Employee"
                            name="employee_id"
                            type="select"
                            value={formData.employee_id ?? ""}
                            onChange={(e) => updateField("employee_id", e.target.value)}
                            options={employeeOptions}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Assigned date"
                            name="assigned_date"
                            type="date"
                            value={formData.assigned_date ?? ""}
                            onChange={(e) => updateField("assigned_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Return date"
                            name="return_date"
                            type="date"
                            value={formData.return_date ?? ""}
                            onChange={(e) => updateField("return_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <ActionButtons submitLabel="Update assignment" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
