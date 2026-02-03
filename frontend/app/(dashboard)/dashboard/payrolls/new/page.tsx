"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPayroll } from "@/services/api/payrolls";
import { getEmployees } from "@/services/api/employees";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Payroll } from "@/lib/types/payroll";
import type { CreatePayrollData } from "@/services/api/payrolls";
import type { Employee } from "@/lib/types/employee";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }) }));

export default function NewPayrollPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" })
            .then((r) => setEmployees(r.data))
            .catch(() => setEmployees([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Payroll, CreatePayrollData, CreatePayrollData>({
        initialData: {
            employee_id: undefined as unknown as number,
            year: currentYear,
            month: new Date().getMonth() + 1,
            basic_salary: 0,
            total_allowances: 0,
            total_deductions: 0,
        },
        createFunction: async (data) => {
            const res = await createPayroll({
                employee_id: Number(data.employee_id)!,
                year: Number(data.year)!,
                month: Number(data.month)!,
                basic_salary: Number(data.basic_salary)!,
                total_allowances: data.total_allowances != null ? Number(data.total_allowances) : undefined,
                total_deductions: data.total_deductions != null ? Number(data.total_deductions) : undefined,
            });
            return res as unknown as { data: Payroll };
        },
        onSuccess: () => router.push("/dashboard/payrolls"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (data.year == null || data.year === "") return "Year is required";
            if (data.month == null || data.month === "") return "Month is required";
            const y = Number(data.year);
            const m = Number(data.month);
            if (isNaN(y) || y < 2020 || y > 2030) return "Year must be between 2020 and 2030";
            if (isNaN(m) || m < 1 || m > 12) return "Month must be 1–12";
            if (data.basic_salary == null || data.basic_salary === "") return "Basic salary is required";
            const sal = Number(data.basic_salary);
            if (isNaN(sal) || sal < 0) return "Basic salary must be a valid non-negative number";
            return null;
        },
    });

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: `${e.first_name} ${e.last_name} (${e.work_email})`,
    }));

    const yearOptions = YEAR_OPTIONS.map((y) => ({ value: y, label: String(y) }));

    return (
        <ProtectedPage permission={PERMISSIONS.PAYROLLS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create payroll</h1>
                    <p className="text-gray-600 mt-1">Add a new payroll record</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Employee"
                        name="employee_id"
                        type="select"
                        value={formData.employee_id ?? ""}
                        onChange={(e) => updateField("employee_id", e.target.value)}
                        options={employeeOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Year"
                            name="year"
                            type="select"
                            value={formData.year ?? ""}
                            onChange={(e) => updateField("year", e.target.value)}
                            options={yearOptions}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Month"
                            name="month"
                            type="select"
                            value={formData.month ?? ""}
                            onChange={(e) => updateField("month", e.target.value)}
                            options={MONTH_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Basic salary"
                        name="basic_salary"
                        type="number"
                        value={formData.basic_salary ?? ""}
                        onChange={(e) => updateField("basic_salary", e.target.value)}
                        required
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Total allowances"
                        name="total_allowances"
                        type="number"
                        value={formData.total_allowances ?? ""}
                        onChange={(e) => updateField("total_allowances", e.target.value)}
                        disabled={isSubmitting}
                        min={0}
                    />
                    <FormField
                        label="Total deductions"
                        name="total_deductions"
                        type="number"
                        value={formData.total_deductions ?? ""}
                        onChange={(e) => updateField("total_deductions", e.target.value)}
                        disabled={isSubmitting}
                        min={0}
                    />
                    <ActionButtons submitLabel="Create payroll" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
