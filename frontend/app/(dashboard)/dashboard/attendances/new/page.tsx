"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAttendance } from "@/services/api/attendances";
import { getEmployees } from "@/services/api/employees";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { ApiResponse } from "@/lib/types/api";
import type { Attendance } from "@/lib/types/attendance";
import type { CreateAttendanceData } from "@/services/api/attendances";
import type { Employee } from "@/lib/types/employee";

type FormState = Partial<CreateAttendanceData> & {
    check_in_time?: string;
    check_out_time?: string;
};

const STATUS_OPTIONS = [
    { value: "present", label: "Present" },
    { value: "absent", label: "Absent" },
    { value: "half_day", label: "Half day" },
    { value: "on_leave", label: "On leave" },
    { value: "late", label: "Late" },
];

function toDateTime(date: string, time: string): string {
    if (!date || !time) return "";
    return `${date} ${time}:00`;
}

export default function NewAttendancePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc", deleted: "without" })
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
    } = useEntityForm<Attendance & FormState, CreateAttendanceData, CreateAttendanceData>({
        initialData: {
            employee_id: undefined as unknown as number,
            date: "",
            check_in_time: "",
            check_out_time: "",
            status: "present",
            notes: "",
            break_duration_minutes: undefined as unknown as number,
        },
        createFunction: async (data) => {
            const d = data as FormState;
            const payload: CreateAttendanceData = {
                employee_id: Number(d.employee_id)!,
                date: d.date!,
                status: (d.status as CreateAttendanceData["status"]) || "present",
                notes: d.notes?.trim() || undefined,
                break_duration_minutes: d.break_duration_minutes != null ? Number(d.break_duration_minutes) : undefined,
            };
            const tIn = (d.check_in_time ?? "").trim();
            const tOut = (d.check_out_time ?? "").trim();
            if (tIn) payload.check_in = toDateTime(d.date!, tIn);
            if (tOut) payload.check_out = toDateTime(d.date!, tOut);
            const res = await createAttendance(payload);
            return res as ApiResponse<Attendance & FormState>;
        },
        onSuccess: () => router.push("/dashboard/attendances"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.date) return "Date is required";
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

    const employeeOptions = employees.map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }));

    return (
        <ProtectedPage permission={PERMISSIONS.ATTENDANCES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Attendance</h1>
                    <p className="text-gray-600 mt-1">Add an attendance record</p>
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
                    <FormField
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date ?? ""}
                        onChange={(e) => updateField("date", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Check-in (time)"
                            name="check_in_time"
                            type="time"
                            value={formData.check_in_time ?? ""}
                            onChange={(e) => updateField("check_in_time", e.target.value)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Check-out (time)"
                            name="check_out_time"
                            type="time"
                            value={formData.check_out_time ?? ""}
                            onChange={(e) => updateField("check_out_time", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? "present"}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Break (minutes)"
                        name="break_duration_minutes"
                        type="number"
                        value={formData.break_duration_minutes ?? ""}
                        onChange={(e) => updateField("break_duration_minutes", e.target.value)}
                        placeholder="0"
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Notes"
                        name="notes"
                        type="textarea"
                        value={formData.notes ?? ""}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Optional notes"
                        disabled={isSubmitting}
                        rows={2}
                    />
                    <ActionButtons submitLabel="Create Attendance" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
