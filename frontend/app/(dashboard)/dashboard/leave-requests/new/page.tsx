"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createLeaveRequest } from "@/services/api/leave-requests";
import { getActiveLeaveTypes } from "@/services/api/leave-types";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { LeaveType } from "@/lib/types/leave-type";

export default function NewLeaveRequestPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [leaveTypeId, setLeaveTypeId] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);

    useEffect(() => {
        getActiveLeaveTypes()
            .then((list) => setLeaveTypes(Array.isArray(list) ? list : []))
            .catch(() => setLeaveTypes([]))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const empId = user?.employee?.id;
        if (!empId) {
            setError("You must be linked to an employee to submit a leave request.");
            return;
        }
        if (!leaveTypeId || !startDate || !endDate) {
            setError("Leave type, start date, and end date are required.");
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            setError("End date must be on or after start date.");
            return;
        }
        try {
            setSubmitting(true);
            await createLeaveRequest({
                employee_id: empId,
                leave_type_id: Number(leaveTypeId),
                start_date: startDate,
                end_date: endDate,
                reason: reason.trim() || undefined,
                attachment: attachment ?? undefined,
            });
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create leave request");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading form...</div>
            </div>
        );
    }

    const leaveTypeOptions = leaveTypes.map((t) => ({ value: String(t.id), label: `${t.name} (${t.code})` }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">New leave request</h1>
                <p className="text-gray-600 mt-1">Submit a leave request</p>
            </div>
            <FormContainer onSubmit={handleSubmit} error={error}>
                <FormField
                    label="Leave type"
                    name="leave_type_id"
                    type="select"
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(e.target.value)}
                    options={leaveTypeOptions}
                    required
                    disabled={submitting}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Start date"
                        name="start_date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        disabled={submitting}
                    />
                    <FormField
                        label="End date"
                        name="end_date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <FormField
                    label="Reason"
                    name="reason"
                    type="textarea"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional"
                    disabled={submitting}
                    rows={3}
                />
                <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                        Attachment (optional)
                    </label>
                    <input
                        id="attachment"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                        disabled={submitting}
                        className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">JPG, PNG, or PDF, max 2MB</p>
                </div>
                <ActionButtons submitLabel="Submit request" isSubmitting={submitting} />
            </FormContainer>
        </div>
    );
}
