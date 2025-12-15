<?php

namespace App\Services;

use App\DataTransferObjects\AssignRoleDTO;
use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRoleRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Exception;

class EmployeeRoleService
{
    public function __construct(
        protected EmployeeRoleRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Assign role to employee.
     */
    public function assign(Employee $employee, AssignRoleDTO $dto)
    {
        try {
            $employee = $this->repository->assignRole($employee, $dto->role);

            $this->activityLogger->log(
                logName: 'employeeRole',
                description: 'role_assigned_to_employee',
                subject: $employee,
                properties: [
                    'employee_id' => $employee->id,
                    'role' => $dto->role,
                ]
            );

            Log::info('Role assigned successfully', [
                'employee_id' => $employee->id,
                'role' => $dto->role,
            ]);

            return $employee;
        } catch (Exception $e) {
            Log::error('Error assigning role: ' . $e->getMessage());
            throw $e;
        }
    }
}
