"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
  loadingComponent?: ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = true,
  children,
  fallback = null,
  showLoading = false,
  loadingComponent,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoadingPermissions } =
    usePermissions();

  if (showLoading && isLoadingPermissions) {
    return <>{loadingComponent || null}</>;
  }

  if (isLoadingPermissions && !showLoading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    return null;
  }

  return <>{hasAccess ? children : fallback}</>;
}

