<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRoleRepositoryInterface;

class EmployeeRoleRepository implements EmployeeRoleRepositoryInterface
{
   /**
     * Assign role to an Employee.
     */
    public function assignRole(Employee $employee, string $role): Employee
    {
        $employee->syncRoles([$role]); 
        return $employee->load('roles', 'permissions');
    }
}
