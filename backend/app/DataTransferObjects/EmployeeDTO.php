<?php

namespace App\DataTransferObjects;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;

class EmployeeDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $work_email,
        public readonly string $phone,
        public readonly string $gender,
        public readonly string $national_id,
        public readonly string $birth_date,
        public readonly string $address,
        public readonly string $employee_status,
        public readonly int $department_id,
        public readonly ?int $manager_id,
        public readonly ?int $job_id,
        public readonly string $hire_date,
        public readonly string $personal_email,
        public readonly ?string $password = null,
    ) {}

    public static function fromStoreRequest(StoreEmployeeRequest $request): self
    {
        return new self(
            first_name: $request->validated('first_name'),
            last_name: $request->validated('last_name'),
            work_email: $request->validated('work_email'),
            phone: $request->validated('phone'),
            gender: $request->validated('gender'),
            national_id: $request->validated('national_id'),
            birth_date: $request->validated('birth_date'),
            address: $request->validated('address'),
            employee_status: $request->validated('employee_status') ?? 'probation',
            hire_date: $request->validated('hire_date'),
            department_id: $request->validated('department_id'),
            manager_id: $request->validated('manager_id') ?? null,
            job_id: $request->validated('job_id'),
            personal_email: $request->validated('personal_email'),
            password: $request->validated('password'),
        );
    }

    public static function fromUpdateRequest(UpdateEmployeeRequest $request): self
    {
        return new self(
            first_name: $request->validated('first_name'),
            last_name: $request->validated('last_name'),
            work_email: $request->validated('work_email'),
            phone: $request->validated('phone'),
            gender: $request->validated('gender'),
            national_id: $request->validated('national_id'),
            birth_date: $request->validated('birth_date'),
            address: $request->validated('address'),
            employee_status: $request->validated('employee_status'),
            hire_date: $request->validated('hire_date'),
            department_id: $request->validated('department_id'),
            manager_id: $request->validated('manager_id') ?? null,
            job_id: $request->validated('job_id'),
            personal_email: $request->validated('personal_email'),
            password: $request->filled('password') ? $request->validated('password') : null,
        );
    }

    public function toArray(): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'work_email' => $this->work_email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'national_id' => $this->national_id,
            'birth_date' => $this->birth_date,
            'address' => $this->address,
            'employee_status' => $this->employee_status,
            'hire_date' => $this->hire_date,
            'department_id' => $this->department_id,
            'manager_id' => $this->manager_id,
            'job_id' => $this->job_id,
            'personal_email' => $this->personal_email,
            'password' => $this->password,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove immutable fields from updates (shouldn't change)
        unset($data['national_id'], $data['hire_date']);
        // Remove personal_email and password - they're handled separately for User model
        unset($data['personal_email'], $data['password']);

        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
