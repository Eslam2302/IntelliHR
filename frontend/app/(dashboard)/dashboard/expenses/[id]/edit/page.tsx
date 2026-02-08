"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExpense, updateExpense } from "@/services/api/expenses";
import { getEmployees } from "@/services/api/employees";
import { getExpenseCategories } from "@/services/api/expense-categories";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Expense } from "@/lib/types/expense";
import type { UpdateExpenseData } from "@/services/api/expenses";
import type { Employee } from "@/lib/types/employee";
import type { ExpenseCategory } from "@/lib/types/expense-category";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

export default function EditExpensePage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    useEffect(() => {
        Promise.all([
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
            getExpenseCategories({ perPage: 500, sortBy: "name", sortOrder: "asc" }),
        ])
            .then(([emp, cat]) => {
                setEmployees(emp.data);
                setCategories(cat.data);
            })
            .catch(() => {})
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: expense, isLoading } = useEntity<Expense>({
        fetchFunction: getExpense,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Expense, UpdateExpenseData, UpdateExpenseData>({
        initialData: {
            employee_id: undefined as unknown as number,
            category_id: undefined as unknown as number,
            amount: undefined as unknown as number,
            expense_date: "",
            status: "pending",
            notes: "",
            receipt_path: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            // Ensure notes is always a string (required by backend)
            // The data parameter is the formData from useEntityForm
            // Get notes value - check both data.notes and formData.notes to be safe
            const notesFromData = data.notes;
            const notesFromForm = formData.notes;
            const notesValue = (notesFromData || notesFromForm || "").toString().trim();
            
            if (!notesValue) {
                throw new Error("Notes is required. Please enter a note before submitting.");
            }
            
            const res = await updateExpense(entityId, {
                employee_id: data.employee_id ? Number(data.employee_id) : undefined,
                category_id: data.category_id ? Number(data.category_id) : undefined,
                amount: data.amount ? Number(data.amount) : undefined,
                expense_date: data.expense_date?.trim() || undefined,
                status: data.status || null,
                notes: notesValue,
                receipt_path: receiptFile || data.receipt_path?.trim() || null,
            });
            return res as unknown as { data: Expense };
        },
        onSuccess: () => router.push(`/dashboard/expenses/${id}`),
        validate: (data) => {
            if (data.amount && data.amount <= 0) return "Amount must be greater than 0";
            if (!data.notes?.trim()) return "Notes is required";
            return null;
        },
    });

    useEffect(() => {
        if (expense) {
            setFormData({
                employee_id: expense.employee_id ?? undefined,
                category_id: expense.category_id ?? undefined,
                amount: expense.amount ?? undefined,
                expense_date: expense.expense_date ? new Date(expense.expense_date).toISOString().split("T")[0] : "",
                status: expense.status ?? "pending",
                notes: expense.notes ?? "",
                receipt_path: expense.receipt_path ?? "",
            });
        }
    }, [expense, setFormData]);

    if (isLoading && !expense) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!expense) return null;

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const employeeOptions = employees.map((e) => ({ value: e.id, label: getEmployeeDisplayLabel(e, e.id) }));
    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.EXPENSES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit expense</h1>
                    <p className="text-gray-600 mt-1">Expense #{expense.id}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Employee"
                            name="employee_id"
                            type="select"
                            value={formData.employee_id ?? ""}
                            onChange={(e) => updateField("employee_id", e.target.value)}
                            options={employeeOptions}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Category"
                            name="category_id"
                            type="select"
                            value={formData.category_id ?? ""}
                            onChange={(e) => updateField("category_id", e.target.value)}
                            options={categoryOptions}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount ?? ""}
                            onChange={(e) => updateField("amount", e.target.value)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Expense date"
                            name="expense_date"
                            type="date"
                            value={formData.expense_date ?? ""}
                            onChange={(e) => updateField("expense_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? ""}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Notes"
                        name="notes"
                        type="textarea"
                        value={formData.notes ?? ""}
                        onChange={(e) => updateField("notes", e.target.value)}
                        required
                        disabled={isSubmitting}
                        rows={3}
                    />
                    <FormField
                        label="Receipt file"
                        name="receipt_path"
                        type="file"
                        onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            setReceiptFile(file || null);
                        }}
                        disabled={isSubmitting}
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {formData.receipt_path && !receiptFile && (
                        <div className="text-sm text-gray-600">
                            Current receipt: {formData.receipt_path}
                        </div>
                    )}
                    <ActionButtons submitLabel="Update expense" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
