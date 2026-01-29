"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, getEmployees } from "@/services/api/employees";
import { getDepartments } from "@/services/api/departments";
import { getJobPositions } from "@/services/api/job-positions";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { ApiResponse } from "@/lib/types/api";
import type { Employee } from "@/lib/types/employee";
import type { CreateEmployeeData } from "@/services/api/employees";
import type { Department } from "@/lib/types/department";
import type { JobPosition } from "@/services/api/job-positions";

type FormState = Partial<CreateEmployeeData> & {
    password_confirmation?: string;
};

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "probation", label: "Probation" },
    { value: "resigned", label: "Resigned" },
    { value: "terminated", label: "Terminated" },
];

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]+$/;

export default function NewEmployeePage() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [managers, setManagers] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [deptRes, jobRes, empRes] = await Promise.all([
                    getDepartments({ perPage: 500, sortBy: "name", sortOrder: "asc" }),
                    getJobPositions({ perPage: 500, sortBy: "title", sortOrder: "asc" }),
                    getEmployees({ perPage: 300, sortBy: "first_name", sortOrder: "asc", deleted: "without" }),
                ]);
                setDepartments(deptRes.data);
                setJobPositions(jobRes.data);
                setManagers(empRes.data);
            } catch {
                setDepartments([]);
                setJobPositions([]);
                setManagers([]);
            } finally {
                setLoadingOptions(false);
            }
        }
        load();
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Employee & FormState, CreateEmployeeData, CreateEmployeeData>({
        initialData: {
            first_name: "",
            last_name: "",
            work_email: "",
            phone: "",
            gender: "male",
            national_id: "",
            birth_date: "",
            address: "",
            employee_status: "probation",
            department_id: undefined,
            manager_id: undefined,
            job_id: undefined,
            hire_date: "",
            personal_email: "",
            password: "",
            password_confirmation: "",
        },
        createFunction: async (data) => {
            const payload: CreateEmployeeData = {
                first_name: data.first_name!.trim(),
                last_name: data.last_name!.trim(),
                work_email: data.work_email?.trim() ?? "",
                phone: data.phone?.trim() ?? "",
                gender: (data.gender as "male" | "female") || "male",
                national_id: data.national_id!.trim(),
                birth_date: data.birth_date!,
                address: data.address?.trim() ?? "",
                department_id: Number(data.department_id)!,
                manager_id: data.manager_id ? Number(data.manager_id) : undefined,
                job_id: data.job_id ? Number(data.job_id) : undefined,
                hire_date: data.hire_date!,
                employee_status: (data.employee_status as "active" | "probation" | "resigned" | "terminated") || "probation",
                personal_email: data.personal_email!.trim(),
                password: data.password!,
                password_confirmation: data.password_confirmation!,
            };
            const res = await createEmployee(payload);
            return res as ApiResponse<Employee & FormState>;
        },
        onSuccess: () => {
            router.push("/dashboard/employees");
        },
        validate: (data) => {
            if (!data.first_name?.trim()) return "First name is required";
            if (!data.last_name?.trim()) return "Last name is required";
            if (!data.gender) return "Gender is required";
            if (!data.national_id?.trim()) return "National ID is required";
            if (!data.birth_date) return "Birth date is required";
            if (!data.department_id) return "Department is required";
            if (!data.hire_date) return "Hire date is required";
            if (!data.personal_email?.trim()) return "Personal email is required";
            if (!data.password) return "Password is required";
            if (data.password.length < 8) return "Password must be at least 8 characters";
            if (!PASSWORD_REGEX.test(data.password))
                return "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)";
            if (data.password !== data.password_confirmation) return "Passwords do not match";
            return null;
        },
    });

    if (loadingOptions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading form...</div>
            </div>
        );
    }

    const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
    const jobOptions = jobPositions.map((j) => ({ value: j.id, label: j.title }));
    const managerOptions = managers.map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }));

    return (
        <ProtectedPage permission={PERMISSIONS.EMPLOYEES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Employee</h1>
                    <p className="text-gray-600 mt-1">Add a new employee to your organization</p>
                </div>

                <FormContainer onSubmit={handleSubmit} error={error}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="First Name"
                            name="first_name"
                            type="text"
                            value={formData.first_name ?? ""}
                            onChange={(e) => updateField("first_name", e.target.value)}
                            placeholder="e.g. John"
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Last Name"
                            name="last_name"
                            type="text"
                            value={formData.last_name ?? ""}
                            onChange={(e) => updateField("last_name", e.target.value)}
                            placeholder="e.g. Doe"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <FormField
                        label="Work Email"
                        name="work_email"
                        type="email"
                        value={formData.work_email ?? ""}
                        onChange={(e) => updateField("work_email", e.target.value)}
                        placeholder="john.doe@company.com"
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Personal Email"
                        name="personal_email"
                        type="email"
                        value={formData.personal_email ?? ""}
                        onChange={(e) => updateField("personal_email", e.target.value)}
                        placeholder="john.personal@gmail.com"
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Phone"
                        name="phone"
                        type="text"
                        value={formData.phone ?? ""}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="e.g. 01111111111"
                        disabled={isSubmitting}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Gender"
                            name="gender"
                            type="select"
                            value={formData.gender ?? "male"}
                            onChange={(e) => updateField("gender", e.target.value)}
                            options={GENDER_OPTIONS}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="National ID"
                            name="national_id"
                            type="text"
                            value={formData.national_id ?? ""}
                            onChange={(e) => updateField("national_id", e.target.value)}
                            placeholder="National ID"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Birth Date"
                            name="birth_date"
                            type="date"
                            value={formData.birth_date ?? ""}
                            onChange={(e) => updateField("birth_date", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Hire Date"
                            name="hire_date"
                            type="date"
                            value={formData.hire_date ?? ""}
                            onChange={(e) => updateField("hire_date", e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <FormField
                        label="Address"
                        name="address"
                        type="textarea"
                        value={formData.address ?? ""}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Optional address"
                        disabled={isSubmitting}
                        rows={2}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            label="Department"
                            name="department_id"
                            type="select"
                            value={formData.department_id ?? ""}
                            onChange={(e) => updateField("department_id", e.target.value)}
                            options={departmentOptions}
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Job Position"
                            name="job_id"
                            type="select"
                            value={formData.job_id ?? ""}
                            onChange={(e) => updateField("job_id", e.target.value)}
                            options={jobOptions}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Manager"
                            name="manager_id"
                            type="select"
                            value={formData.manager_id ?? ""}
                            onChange={(e) => updateField("manager_id", e.target.value)}
                            options={managerOptions}
                            disabled={isSubmitting}
                        />
                    </div>

                    <FormField
                        label="Employee Status"
                        name="employee_status"
                        type="select"
                        value={formData.employee_status ?? "probation"}
                        onChange={(e) => updateField("employee_status", e.target.value)}
                        options={STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />

                    <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Account password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password ?? ""}
                                onChange={(e) => updateField("password", e.target.value)}
                                placeholder="Min 8 chars, upper, lower, number, special"
                                required
                                disabled={isSubmitting}
                            />
                            <FormField
                                label="Confirm Password"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation ?? ""}
                                onChange={(e) => updateField("password_confirmation", e.target.value)}
                                placeholder="Re-enter password"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <ActionButtons submitLabel="Create Employee" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
