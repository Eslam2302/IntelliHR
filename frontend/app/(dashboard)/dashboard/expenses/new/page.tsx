"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/services/api/expenses";
import { getEmployees } from "@/services/api/employees";
import { getExpenseCategories } from "@/services/api/expense-categories";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Expense } from "@/lib/types/expense";
import type { CreateExpenseData } from "@/services/api/expenses";
import type { Employee } from "@/lib/types/employee";
import type { ExpenseCategory } from "@/lib/types/expense-category";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

export default function NewExpensePage() {
    const router = useRouter();
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

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Expense, CreateExpenseData, CreateExpenseData>({
        initialData: {
            employee_id: undefined as unknown as number,
            category_id: undefined as unknown as number,
            amount: undefined as unknown as number,
            expense_date: "",
            status: "pending",
            notes: "",
            receipt_path: "",
        },
        createFunction: async (data) => {
            const res = await createExpense({
                employee_id: Number(data.employee_id)!,
                category_id: Number(data.category_id)!,
                amount: Number(data.amount)!,
                expense_date: data.expense_date!,
                status: data.status || null,
                notes: data.notes?.trim() || null,
                receipt_path: receiptFile || data.receipt_path?.trim() || null,
            });
            return res as unknown as { data: Expense };
        },
        onSuccess: () => router.push("/dashboard/expenses"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.category_id) return "Category is required";
            if (!data.amount || data.amount <= 0) return "Amount must be greater than 0";
            if (!data.expense_date?.trim()) return "Expense date is required";
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

    const employeeOptions = employees.map((e) => ({ value: e.id, label: getEmployeeDisplayLabel(e, e.id) }));
    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

    return (
        <ProtectedPage permission={PERMISSIONS.EXPENSES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create expense</h1>
                    <p className="text-gray-600 mt-1">Add a new employee expense</p>
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
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Category"
                            name="category_id"
                            type="select"
                            value={formData.category_id ?? ""}
                            onChange={(e) => updateField("category_id", e.target.value)}
                            options={categoryOptions}
                            required
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
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Expense date"
                            name="expense_date"
                            type="date"
                            value={formData.expense_date ?? ""}
                            onChange={(e) => updateField("expense_date", e.target.value)}
                            required
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
                    <ActionButtons submitLabel="Create expense" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
