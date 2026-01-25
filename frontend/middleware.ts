import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PERMISSIONS } from "@/lib/constants/permissions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const PERMISSION_ROUTES: Record<string, string[]> = {
  // Department routes
  "/dashboard/departments": [PERMISSIONS.DEPARTMENTS.VIEW_ALL],
  "/dashboard/departments/new": [PERMISSIONS.DEPARTMENTS.CREATE],

  // Employee routes
  "/dashboard/employees": [PERMISSIONS.EMPLOYEES.VIEW_ALL],
  "/dashboard/employees/new": [PERMISSIONS.EMPLOYEES.CREATE],
};

function getRoutePermissions(pathname: string): string[] | null {
  // Check static routes first
  if (PERMISSION_ROUTES[pathname]) {
    return PERMISSION_ROUTES[pathname];
  }

  // Department edit route
  const editDepartmentMatch = pathname.match(/^\/dashboard\/departments\/(\d+)\/edit$/);
  if (editDepartmentMatch) {
    return [PERMISSIONS.DEPARTMENTS.EDIT];
  }

  // Department delete route (if you have a delete confirmation page)
  const deleteDepartmentMatch = pathname.match(/^\/dashboard\/departments\/(\d+)\/delete$/);
  if (deleteDepartmentMatch) {
    return [PERMISSIONS.DEPARTMENTS.DELETE];
  }

  // Employee edit route
  const editEmployeeMatch = pathname.match(/^\/dashboard\/employees\/(\d+)\/edit$/);
  if (editEmployeeMatch) {
    return [PERMISSIONS.EMPLOYEES.EDIT];
  }

  // Employee delete route (if you have a delete confirmation page)
  const deleteEmployeeMatch = pathname.match(/^\/dashboard\/employees\/(\d+)\/delete$/);
  if (deleteEmployeeMatch) {
    return [PERMISSIONS.EMPLOYEES.DELETE];
  }

  return null;
}
function getPermissions(request: NextRequest): string[] {
  const permissionsCookie = request.cookies.get("permissions")?.value;

  if (!permissionsCookie) {
    return [];
  }

  try {
    const parsed = JSON.parse(permissionsCookie);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

async function fetchPermissionsFromBackend(token: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const userData = await response.json();
    if (userData.permissions && Array.isArray(userData.permissions)) {
      return userData.permissions;
    }
    return [];
  } catch {
    return [];
  }
}

function hasPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const publicRoutes = ["/login", "/access-denied"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute && token && pathname !== "/access-denied") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredPermissions = getRoutePermissions(pathname);

  if (requiredPermissions && token) {
    let userPermissions = getPermissions(request);

    if (userPermissions.length === 0) {
      userPermissions = await fetchPermissionsFromBackend(token);

      if (userPermissions.length === 0) {
        const accessDeniedUrl = new URL("/access-denied", request.url);
        accessDeniedUrl.searchParams.set("from", pathname);
        accessDeniedUrl.searchParams.set("required", requiredPermissions.join(","));
        accessDeniedUrl.searchParams.set("userPerms", "");
        accessDeniedUrl.searchParams.set("reason", "no-permissions-found");
        return NextResponse.redirect(accessDeniedUrl);
      }
    }

    if (!hasPermission(userPermissions, requiredPermissions)) {
      const accessDeniedUrl = new URL("/access-denied", request.url);
      accessDeniedUrl.searchParams.set("from", pathname);
      accessDeniedUrl.searchParams.set("required", requiredPermissions.join(","));
      accessDeniedUrl.searchParams.set("userPerms", userPermissions.join(","));
      return NextResponse.redirect(accessDeniedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
