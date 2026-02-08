"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getRole } from "@/services/api/roles";
import { useEntity } from "@/hooks/useEntity";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Role } from "@/lib/types/role";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:gap-4 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500 shrink-0 sm:w-48">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value ?? "—"}</dd>
    </div>
  );
}

export default function RoleViewPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: role, isLoading, error } = useEntity<Role>({
    fetchFunction: getRole,
    entityId: id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading role...</div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500">{error || "Role not found"}</p>
        <Link href="/dashboard/roles" className="text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to list
        </Link>
      </div>
    );
  }

  const permissionNames = role.permissions?.map((p) => p.name) ?? [];

  return (
    <ProtectedPage permission={PERMISSIONS.ROLES.MANAGE}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          title={role.name}
          description={`${permissionNames.length} permission(s) assigned`}
          action={
            <div className="flex items-center gap-3">
              <Link href="/dashboard/roles" className="text-gray-600 hover:text-gray-900 font-medium">
                ← Back to list
              </Link>
              <PermissionGuard permission={PERMISSIONS.ROLES.MANAGE}>
                <Link
                  href={`/dashboard/roles/${role.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </PermissionGuard>
            </div>
          }
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <dl className="px-6 divide-y divide-gray-100">
            <DetailRow label="Name" value={role.name} />
            <DetailRow
              label="Permissions"
              value={
                permissionNames.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs text-gray-700">
                    {permissionNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  "None"
                )
              }
            />
            <DetailRow label="Created" value={role.created_at ? new Date(role.created_at).toLocaleString() : "—"} />
            <DetailRow label="Updated" value={role.updated_at ? new Date(role.updated_at).toLocaleString() : "—"} />
          </dl>
        </div>
      </div>
    </ProtectedPage>
  );
}
