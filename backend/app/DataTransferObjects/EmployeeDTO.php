<?php

namespace App\DataTransferObjects;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;

class EmployeeDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $job_title,
        public readonly string $personal_email,
        public readonly string $phone,
        public readonly string $hire_date,
        public readonly int $department_id,
        public readonly ?int $manager_id,
        public readonly string $email,
        public readonly ?string $password = null,
    ) {}

    public static function fromStoreRequest(StoreEmployeeRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            job_title: $request->validated('job_title'),
            personal_email: $request->validated('personal_email'),
            phone: $request->validated('phone'),
            hire_date: $request->validated('hire_date'),
            department_id: $request->validated('department_id'),
            manager_id: $request->validated('manager_id'),
            email: $request->validated('email'),
            password: $request->validated('password'),
        );
    }

    public static function fromUpdateRequest(UpdateEmployeeRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            job_title: $request->validated('job_title'),
            personal_email: $request->validated('personal_email'),
            phone: $request->validated('phone'),
            hire_date: $request->validated('hire_date'),
            department_id: $request->validated('department_id'),
            manager_id: $request->validated('manager_id'),
            email: $request->validated('email'),
            password: $request->filled('password') ? $request->validated('password') : null,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'job_title' => $this->job_title,
            'personal_email' => $this->personal_email,
            'phone' => $this->phone,
            'hire_date' => $this->hire_date,
            'department_id' => $this->department_id,
            'manager_id' => $this->manager_id,
            'email' => $this->email,
            'password' => $this->password,
        ];
    }
}