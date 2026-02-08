"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRole, updateRole } from "@/services/api/roles";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Role } from "@/lib/types/role";
import type { UpdateRoleData } from "@/services/api/roles";
import { getPermissionGroups } from "@/lib/utils/permissions";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { data: role, isLoading } = useEntity<Role>({ fetchFunction: getRole, entityId: id });
  const permissionGroups = useMemo(() => getPermissionGroups(), []);

  const {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    isSubmitting,
    error,
    setError,
  } = useEntityForm<Role & { permissions?: string[] }, never, UpdateRoleData>({
    initialData: {
      name: "",
      permissions: [],
    },
    updateFunction: async (roleId, data) => {
      return updateRole(roleId, {
        name: data.name?.trim(),
        permissions: data.permissions ?? [],
      });
    },
    entityId: id,
    onSuccess: () => router.push("/dashboard/roles"),
    validate: (data) => {
      if (!data.name?.trim()) return "Name is required";
      return null;
    },
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name ?? "",
        permissions: role.permissions?.map((p) => p.name) ?? [],
      });
    }
  }, [role, setFormData]);

  useEffect(() => {
    if (role && !isLoading) setError(null);
  }, [role, isLoading, setError]);

  const selectedPermissions = formData.permissions ?? [];

  const handlePermissionChange = (permName: string, checked: boolean) => {
    const next = checked
      ? [...selectedPermissions, permName]
      : selectedPermissions.filter((p) => p !== permName);
    updateField("permissions" as keyof Role, next);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading role...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Role not found</div>
      </div>
    );
  }

  return (
    <ProtectedPage permission={PERMISSIONS.ROLES.MANAGE}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit role</h1>
          <p className="text-gray-600 mt-1">{role.name}</p>
        </div>
        <FormContainer onSubmit={handleSubmit} error={error}>
          <FormField
            label="Name"
            name="name"
            type="text"
            value={formData.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. HR Manager"
            required
            disabled={isSubmitting}
          />
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Permissions</label>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
              {permissionGroups.map(({ group, permissions }) => (
                <div key={group} className="p-4 bg-gray-50/50">
                  <p className="text-sm font-semibold text-gray-800 mb-3 capitalize">{group.toLowerCase()}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {permissions.map((perm) => (
                      <label
                        key={perm.name}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100/50 rounded px-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.name)}
                          onChange={(e) => handlePermissionChange(perm.name, e.target.checked)}
                          disabled={isSubmitting}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-mono text-xs text-gray-600">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ActionButtons submitLabel="Update role" isSubmitting={isSubmitting} />
        </FormContainer>
      </div>
    </ProtectedPage>
  );
}
