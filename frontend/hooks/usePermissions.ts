import { useAuth } from "@/context/AuthContext";

export interface UsePermissionsReturn {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
  hasAllPermissions: (permissionList: string[]) => boolean;
  isLoadingPermissions: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { permissions, isLoading } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (isLoading) {
      return false;
    }
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (isLoading) return false;
    if (permissionList.length === 0) return false;
    return permissionList.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (isLoading) return false;
    if (permissionList.length === 0) return true;
    return permissionList.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoadingPermissions: isLoading,
  };
}
