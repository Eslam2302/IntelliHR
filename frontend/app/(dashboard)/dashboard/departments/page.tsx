"use client";

import { useState } from "react";
import Link from "next/link";
import { getDepartments, deleteDepartment } from "@/services/api/departments";
import { useEntityList } from "@/hooks/useEntityList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PermissionButton } from "@/components/common/PermissionButton";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { Department } from "@/lib/types/department";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { SortButtons } from "@/components/ui/SortButtons";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { TableSortIcon } from "@/components/ui/TableSortIcon";

type SortField = "id" | "name" | "created_at" | "updated_at";

const sortOptions: { field: SortField; label: string; icon: string }[] = [
  { field: "id", label: "ID", icon: "#" },
  { field: "name", label: "Name", icon: "A-Z" },
  { field: "created_at", label: "Date Created", icon: "📅" },
  { field: "updated_at", label: "Last Updated", icon: "🔄" },
];

export default function DepartmentsPage() {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: departments,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    perPage,
    searchQuery,
    sortBy,
    sortOrder,
    deletedFilter,
    setCurrentPage,
    setSearchQuery,
    handleSort,
    setDeletedFilter,
    refetch,
  } = useEntityList<Department>({
    fetchFunction: async (params) => {
      return getDepartments({
        page: params.page,
        perPage: params.perPage,
        search: params.search,
        sortBy: params.sortBy as SortField,
        sortOrder: params.sortOrder,
        deleted: params.deleted,
      });
    },
    initialParams: {
      page: 1,
      perPage: 5,
      sortBy: "id",
      sortOrder: "desc",
      deleted: "without",
    },
  });

  const handleDelete = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this department? This action cannot be undone.")
    ) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDepartment(id);
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete department");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<Department>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      onSort: () => handleSort("id"),
      sortIcon: (
        <TableSortIcon isActive={sortBy === "id"} sortOrder={sortOrder} />
      ),
      render: (department) => (
        <div className="text-sm font-medium text-gray-500">#{department.id}</div>
      ),
      className: "whitespace-nowrap",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      onSort: () => handleSort("name"),
      sortIcon: (
        <TableSortIcon isActive={sortBy === "name"} sortOrder={sortOrder} />
      ),
      render: (department) => (
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-900">{department.name}</div>
          {department.deleted_at && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Deleted
            </span>
          )}
        </div>
      ),
      className: "whitespace-nowrap",
    },
    {
      key: "description",
      header: "Description",
      render: (department) => (
        <div className="text-sm text-gray-600 max-w-md">
          {department.description || (
            <span className="italic text-gray-400">No description</span>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      onSort: () => handleSort("created_at"),
      sortIcon: (
        <TableSortIcon isActive={sortBy === "created_at"} sortOrder={sortOrder} />
      ),
      render: (department) => (
        <div className="text-sm text-gray-600">
          {department.created_at
            ? new Date(department.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "-"}
        </div>
      ),
      className: "whitespace-nowrap",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      render: (department) => {
        if (department.deleted_at) {
          return (
            <div className="text-sm text-gray-400 italic">Deleted</div>
          );
        }

        return (
          <div className="flex items-center justify-end gap-3">
            <PermissionGuard permission={PERMISSIONS.DEPARTMENTS.EDIT}>
              <Link
                href={`/dashboard/departments/${department.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>

                Edit
              </Link>
            </PermissionGuard>
            <PermissionButton
              permission={PERMISSIONS.DEPARTMENTS.DELETE}
              onClick={() => handleDelete(department.id)}
              disabled={deletingId === department.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>

              {deletingId === department.id ? "Deleting..." : "Delete"}
            </PermissionButton>
          </div>
        );
      },
      className: "whitespace-nowrap text-right",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage your organization's departments"
        action={
          <PermissionGuard permission={PERMISSIONS.DEPARTMENTS.CREATE}>
            <Link
              href="/dashboard/departments/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>

              Create Department
            </Link>
          </PermissionGuard>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="space-y-4">
            <FilterTabs value={deletedFilter} onChange={setDeletedFilter} />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search departments..."
            />
            <SortButtons
              options={sortOptions}
              sortBy={sortBy as SortField}
              sortOrder={sortOrder}
              onSort={(field) => handleSort(field as string)}
            />
          </div>
        </div>

        {isLoading && departments.length === 0 ? (
          <LoadingSkeleton rows={5} />
        ) : error && departments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : departments.length === 0 ? (
          <EmptyState
            title="No departments"
            description={
              searchQuery
                ? "Try adjusting your search criteria."
                : "Get started by creating a new department."
            }
            action={
              !searchQuery ? (
                <PermissionGuard permission={PERMISSIONS.DEPARTMENTS.CREATE}>
                  <Link
                    href="/dashboard/departments/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>

                    Create Your First Department
                  </Link>
                </PermissionGuard>
              ) : undefined
            }
          />
        ) : (
          <>
            <DataTable
              data={departments}
              columns={columns}
              rowKey={(department) => department.id}
              striped={true}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              perPage={perPage}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
              itemName="departments"
            />
          </>
        )}
      </div>
    </div>
  );
}
