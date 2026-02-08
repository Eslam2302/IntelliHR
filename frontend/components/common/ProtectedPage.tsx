"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedPageProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  redirectOnDenied?: boolean;
}

export function ProtectedPage({
  permission,
  permissions,
  requireAll = true,
  children,
  loadingComponent,
  errorComponent,
  redirectOnDenied = true,
}: ProtectedPageProps) {
  const { isAuthenticated } = useAuth();
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isLoadingPermissions,
  } = usePermissions();
  const router = useRouter();

  let hasAccess = false;
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  const shouldRedirect = !isLoadingPermissions && !hasAccess && redirectOnDenied && !errorComponent;

  useEffect(() => {
    if (!shouldRedirect) return;
    const currentPath = window.location.pathname;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      const required = permission ? permission : permissions?.join(",") || "";
      router.push(
        `/access-denied?from=${encodeURIComponent(currentPath)}&required=${encodeURIComponent(required)}`
      );
    }
  }, [shouldRedirect, isAuthenticated, permission, permissions, router]);

  if (isLoadingPermissions) {
    return <>{loadingComponent || null}</>;
  }

  if (!hasAccess) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    if (redirectOnDenied) {
      return <>{loadingComponent || null}</>;
    }
    return null;
  }

  return <>{children}</>;
}

