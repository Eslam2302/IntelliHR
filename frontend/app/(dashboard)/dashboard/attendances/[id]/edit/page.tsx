"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAttendance, updateAttendance } from "@/services/api/attendances";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { ApiResponse } from "@/lib/types/api";
import type { Attendance } from "@/lib/types/attendance";
import type { UpdateAttendanceData } from "@/services/api/attendances";

type FormState = Partial<UpdateAttendanceData> & { check_in_time?: string; check_out_time?: string };

const STATUS_OPTIONS = [
    { value: "present", label: "Present" },
    { value: "absent", label: "Absent" },
    { value: "half_day", label: "Half day" },
    { value: "on_leave", label: "On leave" },
    { value: "late", label: "Late" },
];

function timeOnly(s: string | null | undefined): string {
    if (!s) return "";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "" : d.toTimeString().slice(0, 5);
}

function toDateTime(date: string, time: string): string {
    if (!date) return "";
    if (!time) return "";
    return `${date} ${time}:00`;
}

export default function EditAttendancePage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const { data: attendance, isLoading } = useEntity<Attendance>({ fetchFunction: getAttendance, entityId: id });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
        setError,
    } = useEntityForm<Attendance & FormState, never, UpdateAttendanceData>({
        initialData: {
            check_in_time: "",
            check_out_time: "",
            status: "present",
            notes: "",
            break_duration_minutes: undefined as unknown as number,
        },
        updateFunction: async (attId, data) => {
            const d = data as FormState;
            const payload: UpdateAttendanceData = {
                status: (d.status as UpdateAttendanceData["status"]) || "present",
                notes: d.notes?.trim() || undefined,
                break_duration_minutes: d.break_duration_minutes != null ? Number(d.break_duration_minutes) : undefined,
            };
            const date = attendance?.date;
            if (date) {
                const cin = toDateTime(date, d.check_in_time ?? "");
                const cout = toDateTime(date, d.check_out_time ?? "");
                if (cin) payload.check_in = cin;
                if (cout) payload.check_out = cout;
            }
            const res = await updateAttendance(attId, payload);
            return res as ApiResponse<Attendance & FormState>;
        },
        entityId: id,
        onSuccess: () => router.push("/dashboard/attendances"),
        validate: () => null,
    });

    useEffect(() => {
        if (attendance) {
            setFormData({
                check_in_time: timeOnly(attendance.check_in),
                check_out_time: timeOnly(attendance.check_out),
                status: attendance.status ?? "present",
                notes: attendance.notes ?? "",
                break_duration_minutes: attendance.break_duration_minutes ?? undefined,
            });
        }
    }, [attendance, setFormData]);

    useEffect(() => {
        if (attendance && !isLoading) setError(null);
    }, [attendance, isLoading, setError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading attendance...</div>
            </div>
        );
    }

    if (!attendance) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Attendance not found</div>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.ATTENDANCES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Attendance</h1>
                    <p className="text-gray-600 mt-1">
                        {attendance.employee?.name ?? `Employee #${attendance.employee_id}`} — {attendance.date ? new Date(attendance.date).toLocaleDateString() : ""}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
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
                    <ActionButtons submitLabel="Update Attendance" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
