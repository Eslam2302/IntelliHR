<?php

namespace App\Repositories\Contracts;

use App\Models\Employee;

interface EmployeeRoleRepositoryInterface
{


    /**
     * Assign role to an Employee.
     */
    public function assignRole(Employee $employee, string $role): Employee;
}
