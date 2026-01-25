"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getDepartment, updateDepartment } from "@/services/api/departments";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Department } from "@/lib/types/department";
import type { UpdateDepartmentData } from "@/services/api/departments";

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = Number(params.id);

  const { data: department, isLoading: isLoadingDepartment } = useEntity<Department>({
    fetchFunction: getDepartment,
    entityId: departmentId,
  });

  const {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    isSubmitting,
    error,
    setError,
  } = useEntityForm<Department, never, UpdateDepartmentData>({
    initialData: {
      name: "",
      description: "",
    },
    updateFunction: async (id, data) => {
      return updateDepartment(id, {
        name: data.name?.trim(),
        description: data.description?.trim() || undefined,
      });
    },
    entityId: departmentId,
    onSuccess: () => {
      router.push("/dashboard/departments");
    },
    validate: (data) => {
      if (!data.name?.trim()) {
        return "Department name is required";
      }
      return null;
    },
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        description: department.description || "",
      });
    }
  }, [department, setFormData]);

  useEffect(() => {
    if (department && !isLoadingDepartment) {
      setError(null);
    }
  }, [department, isLoadingDepartment, setError]);

  if (isLoadingDepartment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading department...</div>
      </div>
    );
  }

  return (
    <ProtectedPage permission={PERMISSIONS.DEPARTMENTS.EDIT}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Department</h1>
          <p className="text-gray-600 mt-1">Update department information</p>
        </div>

        <FormContainer onSubmit={handleSubmit} error={error}>
          <FormField
            label="Department Name"
            name="name"
            type="text"
            value={formData.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Human Resources"
            required
            disabled={isSubmitting}
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Optional description of the department"
            disabled={isSubmitting}
          />

          <ActionButtons
            submitLabel="Update Department"
            isSubmitting={isSubmitting}
          />
        </FormContainer>
      </div>
    </ProtectedPage>
  );
}
