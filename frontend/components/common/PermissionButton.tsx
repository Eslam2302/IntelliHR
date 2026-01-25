"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { PermissionGuard } from "./PermissionGuard";

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
}

export function PermissionButton({
  permission,
  permissions,
  requireAll = true,
  children,
  ...buttonProps
}: PermissionButtonProps) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
    >
      <button {...buttonProps}>{children}</button>
    </PermissionGuard>
  );
}

