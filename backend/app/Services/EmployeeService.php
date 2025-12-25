<?php

namespace App\Services;

use App\DataTransferObjects\EmployeeDTO;
use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class EmployeeService
{
    public function __construct(
        protected EmployeeRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching employees: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(EmployeeDTO $dto): Employee
    {
        try {
            DB::beginTransaction();

            // Create Employee
            $employeeData = $dto->toArray();
            unset($employeeData['email'], $employeeData['password']);
            $employee = $this->repository->create($employeeData);

            // Create associated User
            User::create([
                'employee_id' => $employee->id,
                'email' => $dto->email,
                'password' => Hash::make($dto->password),
            ]);

            $this->activityLogger->log(
                logName: 'employee',
                description: 'employee_created',
                subject: $employee,
                properties: [
                    'name' => $employee->first_name.$employee->last_name,
                    'personal_email' => $employee->personal_email,
                    'phone' => $employee->phone,
                    'department_id' => $employee->department_id,
                    'job_id' => $employee->job_id,
                    'manager_id' => $employee->manager_id,
                ]
            );

            DB::commit();

            Log::info('Employee created successfully', ['id' => $employee->id, 'name' => $employee->name]);

            return $employee->load(['department', 'job', 'manager', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating employee: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(Employee $employee, EmployeeDTO $dto): Employee
    {
        try {
            DB::beginTransaction();

            $oldData = $employee->only([
                'first_name',
                'last_name',
                'phone',
                'employee_status',
                'department_id',
                'manager_id',
                'job_id',
            ]);

            // Update Employee
            $employeeData = $dto->toArray();
            unset($employeeData['email'], $employeeData['password']);
            $updatedEmployee = $this->repository->update($employee, $employeeData);

            // Update associated User
            $userData = ['email' => $dto->email];
            if ($dto->password !== null) {
                $userData['password'] = Hash::make($dto->password);
            }
            $employee->user->update($userData);

            $this->activityLogger->log(
                logName: 'employee',
                description: 'employee_updated',
                subject: $updatedEmployee,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedEmployee
                        ->only([
                            'first_name',
                            'last_name',
                            'phone',
                            'employee_status',
                            'department_id',
                            'manager_id',
                            'job_id',
                        ]),
                ]
            );

            DB::commit();

            Log::info('Employee updated successfully', ['id' => $employee->id, 'name' => $employee->name]);

            return $updatedEmployee->load(['department', 'job', 'manager', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating employee {$employee->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(Employee $employee): bool
    {
        try {
            DB::beginTransaction();

            $data = $employee;

            if ($employee->user) {
                $employee->user->delete();
            }

            $deleted = $this->repository->delete($employee);

            $this->activityLogger->log(
                logName: 'employee',
                description: 'employee_deleted',
                subject: $employee,
                properties: [$data]
            );

            DB::commit();

            Log::info('Employee deleted successfully', ['id' => $employee->id, 'name' => $employee->name]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting employee {$employee->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
