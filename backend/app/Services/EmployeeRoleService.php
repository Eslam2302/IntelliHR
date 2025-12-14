<?php

namespace App\Services;

use App\DataTransferObjects\AssignRoleDTO;
use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRoleRepositoryInterface;
use Illuminate\Support\Facades\Log;

class EmployeeRoleService
{
    public function __construct(
        protected EmployeeRoleRepositoryInterface $repository
    ) {}

    /**
     * Assign role to employee.
     */
    public function assign(Employee $employee, AssignRoleDTO $dto)
    {
        try {
            $employee = $this->repository->assignRole($employee, $dto->role);

            Log::info('Role assigned successfully', [
                'employee_id' => $employee->id,
                'role' => $dto->role,
            ]);

            return $employee;
        } catch (\Exception $e) {
            Log::error('Error assigning role: ' . $e->getMessage());
            throw $e;
        }
    }
}
