/**
 * Format employee for display: name + "(Deleted)" when employee has deleted_at set.
 */
export function getEmployeeDisplayLabel(
  employee: { id: number; name: string; deleted_at?: string | null } | null | undefined,
  employeeId: number
): string {
  const name = employee?.name ?? `Employee #${employeeId}`;
  return employee?.deleted_at ? `${name} (Deleted)` : name;
}
