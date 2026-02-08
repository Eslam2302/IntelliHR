import { PERMISSIONS } from "@/lib/constants/permissions";

export interface PermissionGroup {
  group: string;
  permissions: { name: string }[];
}

/**
 * Flatten PERMISSIONS constant into groups for role create/edit checkboxes.
 */
export function getPermissionGroups(): PermissionGroup[] {
  return Object.entries(PERMISSIONS).map(([group, perms]) => ({
    group: group.replace(/_/g, " "),
    permissions: Object.values(perms as Record<string, string>).map((name) => ({ name })),
  }));
}
