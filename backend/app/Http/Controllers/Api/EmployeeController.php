<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;


class EmployeeController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),

            new Middleware('permission:view-all-employees|Super Admin', only: ['index']),
            new Middleware('permission:view-employee|Super Admin', only: ['show']),
            new Middleware('permission:create-employee|Super Admin', only: ['store']),
            new Middleware('permission:edit-employee|Super Admin', only: ['update']),
            new Middleware('permission:delete-employee|Super Admin', only: ['destroy']),

        ];
    }

    public function index()
    {
        $employees = Employee::with(['department', 'manager', 'user'])->get();
        return EmployeeResource::collection($employees);
    }


    public function store(StoreEmployeeRequest $request)
    {
        // Create New Employee in Employee table
        $employee = Employee::Create([
            'name' => $request->name,
            'job_title' => $request->job_title,
            'personal_email' => $request->personal_email,
            'phone' => $request->phone,
            'hire_date' => $request->hire_date,
            'department_id' => $request->department_id,
            'manager_id' => $request->manager_id,
        ]);

        // Create User Table for Role & Personal Info
        $user = User::Create([
            'employee_id' => $employee->id,
            'email' => $request->email,
            'password'  => Hash::make($request->password),
        ]);

        $employee->load(['department', 'manager', 'user']);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee created successfully.',
            'data' => new EmployeeResource($employee),
        ], 201);
    }


    public function show(Employee $employee)
    {
        return new EmployeeResource($employee);
    }


    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $employee->update([
            'name' => $request->name,
            'job_title' => $request->job_title,
            'personal_email' => $request->personal_email,
            'phone' => $request->phone,
            'hire_date' => $request->hire_date,
            'department_id' => $request->department_id,
            'manager_id' => $request->manager_id,
        ]);

        $userData = ['email' => $request->email];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $employee->user->update($userData);

        $employee->load(['department', 'manager', 'user']);

        return response()->json([
            'status'    =>  'success',
            'message'   =>  'Employee Updated Successfully',
            'date'  =>  new EmployeeResource($employee)
        ], 200);
    }

    public function destroy(Employee $employee)
    {
        if ($employee->user) {
            $employee->user->delete();
        }

        $employee->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Employee and associated user account deleted successfully.'
        ], 204);
    }
}
