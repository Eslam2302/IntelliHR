/**
 * Format employee for display: full name + "(Deleted)" when employee has deleted_at set.
 *
 * Supports multiple backend shapes:
 * - { id, name, deleted_at? }
 * - { id, first_name?, last_name?, deleted_at? }
 */
export function getEmployeeDisplayLabel(
  employee:
    | {
        id: number;
        name?: string;
        first_name?: string;
        last_name?: string;
        deleted_at?: string | null;
      }
    | null
    | undefined,
  employeeId: number,
): string {
  const fullNameFromParts =
    [employee?.first_name, employee?.last_name].filter(Boolean).join(" ") || undefined;

  const name = employee?.name ?? fullNameFromParts ?? `Employee #${employeeId}`;

  return employee?.deleted_at ? `${name} (Deleted)` : name;
}
