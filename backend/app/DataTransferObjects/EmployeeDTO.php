<?php

namespace App\DataTransferObjects;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;

class EmployeeDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $personal_email,
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
        public readonly string $email,
        public readonly ?string $password = null,
    ) {}

    public static function fromStoreRequest(StoreEmployeeRequest $request): self
    {
        return new self(
            first_name: $request->validated('first_name'),
            last_name: $request->validated('last_name'),
            personal_email: $request->validated('personal_email'),
            phone: $request->validated('phone'),
            gender: $request->validated('gender'),
            national_id: $request->validated('national_id'),
            birth_date: $request->validated('birth_date'),
            address: $request->validated('address'),
            employee_status: $request->validated('employee_status'),
            hire_date: $request->validated('hire_date'),
            department_id: $request->validated('department_id'),
            manager_id: $request->validated('manager_id'),
            job_id: $request->validated('job_id'),
            email: $request->validated('email'),
            password: $request->validated('password'),
        );
    }

    public static function fromUpdateRequest(UpdateEmployeeRequest $request): self
    {
        return new self(
           first_name: $request->validated('first_name'),
            last_name: $request->validated('last_name'),
            personal_email: $request->validated('personal_email'),
            phone: $request->validated('phone'),
            gender: $request->validated('gender'),
            national_id: $request->validated('national_id'),
            birth_date: $request->validated('birth_date'),
            address: $request->validated('address'),
            employee_status: $request->validated('employee_status'),
            hire_date: $request->validated('hire_date'),
            department_id: $request->validated('department_id'),
            manager_id: $request->validated('manager_id'),
            job_id: $request->validated('job_id'),
            email: $request->validated('email'),
            password: $request->filled('password') ? $request->validated('password') : null,
        );
    }

    public function toArray(): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'personal_email' => $this->personal_email,
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
            'email' => $this->email,
            'password' => $this->password,
        ];
    }
}
