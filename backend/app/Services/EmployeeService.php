<?php

namespace App\Services;

use App\DataTransferObjects\EmployeeDTO;
use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeService
{
    public function __construct(protected EmployeeRepositoryInterface $repository) {}

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching employees: ' . $e->getMessage());
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

            DB::commit();

            Log::info('Employee created successfully', ['id' => $employee->id, 'name' => $employee->name]);

            return $employee->load(['department', 'manager', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating employee: ' . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(Employee $employee, EmployeeDTO $dto): Employee
    {
        try {
            DB::beginTransaction();

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

            DB::commit();

            Log::info('Employee updated successfully', ['id' => $employee->id, 'name' => $employee->name]);

            return $updatedEmployee->load(['department', 'manager', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating employee {$employee->id}: " . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(Employee $employee): bool
    {
        try {
            DB::beginTransaction();

            if ($employee->user) {
                $employee->user->delete();
            }

            $deleted = $this->repository->delete($employee);

            DB::commit();

            Log::info('Employee deleted successfully', ['id' => $employee->id, 'name' => $employee->name]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting employee {$employee->id}: " . $e->getMessage());
            throw $e;
        }
    }
}