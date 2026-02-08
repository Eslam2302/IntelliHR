"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createRole } from "@/services/api/roles";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { getPermissionGroups } from "@/lib/utils/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Role } from "@/lib/types/role";
import type { CreateRoleData } from "@/services/api/roles";

export default function NewRolePage() {
  const router = useRouter();
  const permissionGroups = useMemo(() => getPermissionGroups(), []);

  const {
    formData,
    updateField,
    handleSubmit,
    isSubmitting,
    error,
  } = useEntityForm<Role & { permissions?: string[] }, CreateRoleData, CreateRoleData>({
    initialData: {
      name: "",
      permissions: [],
    },
    createFunction: async (data) => {
      return createRole({
        name: data.name!.trim(),
        permissions: data.permissions ?? [],
      });
    },
    onSuccess: () => router.push("/dashboard/roles"),
    validate: (data) => {
      if (!data.name?.trim()) return "Name is required";
      return null;
    },
  });

  const selectedPermissions = formData.permissions ?? [];

  const handlePermissionChange = (permName: string, checked: boolean) => {
    const next = checked
      ? [...selectedPermissions, permName]
      : selectedPermissions.filter((p) => p !== permName);
    updateField("permissions" as keyof Role, next);
  };

  return (
    <ProtectedPage permission={PERMISSIONS.ROLES.MANAGE}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create role</h1>
          <p className="text-gray-600 mt-1">Add a new role and assign permissions</p>
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
          <ActionButtons submitLabel="Create role" isSubmitting={isSubmitting} />
        </FormContainer>
      </div>
    </ProtectedPage>
  );
}
