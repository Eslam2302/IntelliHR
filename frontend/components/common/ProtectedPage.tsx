"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isLoadingPermissions,
  } = usePermissions();
  const router = useRouter();

  if (isLoadingPermissions) {
    return <>{loadingComponent || null}</>;
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
    return <>{children}</>;
  }

  if (!hasAccess) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    if (redirectOnDenied) {
      useEffect(() => {
        const currentPath = window.location.pathname;
        const required = permission
          ? permission
          : permissions?.join(",") || "";
        const accessDeniedUrl = `/access-denied?from=${encodeURIComponent(
          currentPath
        )}&required=${encodeURIComponent(required)}`;
        router.push(accessDeniedUrl);
      }, [permission, permissions, router]);

      return <>{loadingComponent || null}</>;
    }

    return null;
  }

  return <>{children}</>;
}

