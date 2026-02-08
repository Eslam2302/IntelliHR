"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getEmployee } from "@/services/api/employees";
import { useEntity } from "@/hooks/useEntity";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { AssignRoleSection } from "@/components/employees/AssignRoleSection";
import type { Employee } from "@/lib/types/employee";

type EmployeeWithUser = Employee & { user?: { id: number; personal_email: string } | null };

function formatDate(s: string | null | undefined): string {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 flex flex-col sm:flex-row sm:gap-4 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500 shrink-0 sm:w-40">{label}</dt>
            <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value ?? "—"}</dd>
        </div>
    );
}

export default function EmployeeViewPage() {
    const params = useParams();
    const employeeId = Number(params.id);

    const { data: employee, isLoading, error } = useEntity<EmployeeWithUser>({
        fetchFunction: getEmployee,
        entityId: employeeId,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading employee...</div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">{error || "Employee not found"}</p>
                <Link
                    href="/dashboard/employees"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    ← Back to employees
                </Link>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        probation: "bg-yellow-100 text-yellow-800",
        resigned: "bg-gray-100 text-gray-800",
        terminated: "bg-red-100 text-red-800",
    };
    const statusClass = statusColors[employee.employee_status] ?? "bg-gray-100 text-gray-800";

    return (
        <ProtectedPage permission={PERMISSIONS.EMPLOYEES.VIEW}>
            <div className="space-y-6 max-w-3xl mx-auto">
                <PageHeader
                    title={`${employee.first_name} ${employee.last_name}`}
                    description="Employee details"
                    action={
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard/employees"
                                className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                                ← Back to list
                            </Link>
                            <PermissionGuard permission={PERMISSIONS.EMPLOYEES.EDIT}>
                                <Link
                                    href={`/dashboard/employees/${employee.id}/edit`}
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
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Personal</h2>
                    </div>
                    <dl className="px-6 divide-y divide-gray-100">
                        <DetailRow label="First name" value={employee.first_name} />
                        <DetailRow label="Last name" value={employee.last_name} />
                        <DetailRow label="Work email" value={employee.work_email} />
                        <DetailRow label="Personal email" value={(employee as EmployeeWithUser).user?.personal_email} />
                        <DetailRow label="Phone" value={employee.phone} />
                        <DetailRow label="Gender" value={employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : null} />
                        <DetailRow label="National ID" value={employee.national_id} />
                        <DetailRow label="Birth date" value={formatDate(employee.birth_date)} />
                        <DetailRow label="Address" value={employee.address} />
                    </dl>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Work</h2>
                    </div>
                    <dl className="px-6 divide-y divide-gray-100">
                        <DetailRow
                            label="Department"
                            value={
                                employee.department ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-sm font-medium">
                                        {employee.department.name}
                                    </span>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Job position"
                            value={
                                employee.job ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium">
                                        {employee.job.title}
                                    </span>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Manager"
                            value={
                                employee.manager ? (
                                    <Link
                                        href={`/dashboard/employees/${employee.manager.id}`}
                                        className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200"
                                    >
                                        {employee.manager.first_name} {employee.manager.last_name}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Status"
                            value={
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium capitalize ${statusClass}`}>
                                    {employee.employee_status}
                                </span>
                            }
                        />
                        <DetailRow label="Hire date" value={formatDate(employee.hire_date)} />
                    </dl>
                </div>

                <PermissionGuard permission={PERMISSIONS.ROLES.ASSIGN}>
                    <AssignRoleSection
                        employeeId={employee.id}
                        employeeName={`${employee.first_name} ${employee.last_name}`}
                        currentRoleNames={employee.roles}
                    />
                </PermissionGuard>
            </div>
        </ProtectedPage>
    );
}
