"use client";

import { useState, useEffect } from "react";
import { getRoles } from "@/services/api/roles";
import { assignRoleToEmployee } from "@/services/api/employees";
import type { Role } from "@/lib/types/role";

export interface AssignRoleSectionProps {
  employeeId: number;
  employeeName: string;
  currentRoleNames?: string[];
}

export function AssignRoleSection({
  employeeId,
  employeeName,
  currentRoleNames,
}: AssignRoleSectionProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRoles({ perPage: 100, page: 1 })
      .then((res) => {
        if (!cancelled) {
          const roleList = res.data ?? [];
          setRoles(roleList);
          const currentRole = currentRoleNames?.[0];
          const currentInList = currentRole && roleList.some((r) => r.name === currentRole);
          setSelectedRoleName(currentInList ? currentRole : roleList[0]?.name ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) setRoles([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRoles(false);
      });
    return () => { cancelled = true; };
  }, [currentRoleNames]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleName.trim()) return;
    setMessage(null);
    setIsSubmitting(true);
    try {
      const res = await assignRoleToEmployee(employeeId, selectedRoleName.trim());
      const data = res.data as { roles?: string[] };
      const assignedRole = Array.isArray(data?.roles) && data.roles.length ? data.roles[0] : null;
      if (assignedRole) setSelectedRoleName(assignedRole);
      setMessage({
        type: "success",
        text: assignedRole ? `Role updated to "${assignedRole}". You can change it again below.` : "Role assigned.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to assign role",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Assign role</h2>
        <p className="text-sm text-gray-600 mt-0.5">
          {currentRoleNames?.length ? (
            <>Current role: <span className="font-medium text-gray-900">{currentRoleNames.join(", ")}</span>. Select a different role below and click Assign to change.</>
          ) : (
            <>Assign a role to {employeeName}. This will replace any existing role.</>
          )}
        </p>
      </div>
      <div className="px-6 py-4">
        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
          >
            {message.text}
          </div>
        )}
        {isLoadingRoles ? (
          <p className="text-sm text-gray-500">Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-gray-500">No roles available. Create roles first in Roles & Permissions.</p>
        ) : (
          <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px]">
              <label htmlFor="assign-role-select" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="assign-role-select"
                value={selectedRoleName}
                onChange={(e) => setSelectedRoleName(e.target.value)}
                disabled={isSubmitting}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Assigning..." : "Assign role"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
