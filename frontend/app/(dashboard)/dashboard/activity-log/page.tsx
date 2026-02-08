"use client";

import { useState, useEffect, useRef } from "react";
import { useEntityList } from "@/hooks/useEntityList";
import { getActivityLog } from "@/services/api/activity-log";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { Activity } from "@/lib/types/activity";

const MODULE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All modules" },
  { value: "employee", label: "Employee" },
  { value: "department", label: "Department" },
  { value: "role", label: "Role" },
  { value: "leaveRequest", label: "Leave request" },
  { value: "leaveType", label: "Leave type" },
  { value: "attendance", label: "Attendance" },
  { value: "payroll", label: "Payroll" },
  { value: "contract", label: "Contract" },
  { value: "document", label: "Document" },
  { value: "applicant", label: "Applicant" },
  { value: "interview", label: "Interview" },
  { value: "jobPost", label: "Job post" },
  { value: "hiringStage", label: "Hiring stage" },
  { value: "asset", label: "Asset" },
  { value: "assetAssignment", label: "Asset assignment" },
  { value: "expense", label: "Expense" },
  { value: "expenseCategory", label: "Expense category" },
  { value: "goal", label: "Goal" },
  { value: "goal_progress_update", label: "Goal progress update" },
  { value: "performance_review", label: "Performance review" },
  { value: "trainingSession", label: "Training session" },
  { value: "trainingCertificate", label: "Training certificate" },
  { value: "trainingEvaluation", label: "Training evaluation" },
  { value: "employeeTraining", label: "Employee training" },
  { value: "trainer", label: "Trainer" },
  { value: "jobPosition", label: "Job position" },
  { value: "benefit", label: "Benefit" },
  { value: "allowance", label: "Allowance" },
  { value: "deduction", label: "Deduction" },
];

export default function ActivityLogPage() {
  const [moduleFilter, setModuleFilter] = useState("");
  const moduleFilterRef = useRef(moduleFilter);
  moduleFilterRef.current = moduleFilter;

  const {
    data: activities,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    perPage,
    setCurrentPage,
    setSearchQuery,
    searchQuery,
    refetch,
  } = useEntityList<Activity>({
    fetchFunction: async (params) =>
      getActivityLog({
        page: params.page,
        perPage: params.perPage,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        module: moduleFilterRef.current || undefined,
      }),
    initialParams: {
      page: 1,
      perPage: 20,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    debounceDelay: 400,
  });

  // Reset to first page when search changes (hook refetches automatically via searchQuery)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, setCurrentPage]);

  // When module filter changes, reset page and refetch (hook does not depend on moduleFilter; we use ref so fetcher sees latest)
  useEffect(() => {
    setCurrentPage(1);
    refetch();
  }, [moduleFilter, setCurrentPage, refetch]);

  const columns: Column<Activity>[] = [
    {
      key: "created_at",
      header: "Date",
      render: (a) => (
        <div className="text-sm text-gray-600 whitespace-nowrap">
          {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
        </div>
      ),
      className: "whitespace-nowrap",
    },
    {
      key: "action",
      header: "Action",
      render: (a) => <div className="text-sm font-medium text-gray-900">{a.action ?? "—"}</div>,
      className: "whitespace-nowrap",
    },
    {
      key: "module",
      header: "Module",
      render: (a) => <div className="text-sm text-gray-600">{a.module ?? "—"}</div>,
      className: "whitespace-nowrap",
    },
    {
      key: "subject",
      header: "Subject",
      render: (a) => (
        <div className="text-sm text-gray-600">
          {a.subject && a.subject_id != null ? `${a.subject} #${a.subject_id}` : (a.subject ?? "—")}
        </div>
      ),
      className: "whitespace-nowrap",
    },
    {
      key: "performed_by",
      header: "Performed by",
      render: (a) => <div className="text-sm text-gray-600">{a.performed_by ?? "—"}</div>,
      className: "whitespace-nowrap",
    },
  ];

  const hasActiveFilters = Boolean(searchQuery.trim()) || Boolean(moduleFilter);
  const clearFilters = () => {
    setSearchQuery("");
    setModuleFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full">
      <PageHeader
        title="Activity log"
        description="View system activity and changes"
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search and filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1 min-w-0">
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by action, module, or subject…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Search activity log"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px]"
                aria-label="Filter by module"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {!isLoading && total >= 0 && (
                <span>
                  {total === 0 ? "No" : total} result{total !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {isLoading && activities.length === 0 ? (
          <LoadingSkeleton rows={10} />
        ) : error && activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button onClick={refetch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No matching activity" : "No activity"}
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Activity will appear here as changes are made."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataTable data={activities} columns={columns} rowKey={(a) => `activity-${a.id}`} striped />
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              perPage={perPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              itemName="activities"
            />
          </>
        )}
      </div>
    </div>
  );
}
