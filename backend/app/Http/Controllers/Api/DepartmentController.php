<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DepartmentController extends Controller implements HasMiddleware
{


    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),

            new Middleware('permission:view-all-departments|Super Admin', only: ['index']),
            new Middleware('permission:view-department|Super Admin', only: ['show']),
            new Middleware('permission:create-department|Super Admin', only: ['store']),
            new Middleware('permission:edit-department|Super Admin', only: ['update']),
            new Middleware('permission:delete-department|Super Admin', only: ['destroy']),

        ];
    }
    public function index()
    {
        $departments = Department::latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => DepartmentResource::collection($departments),
        ], 200);
    }

    public function store(StoreDepartmentRequest $request)
    {

        $department = Department::create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Department created successfully.',
            'data' => new DepartmentResource($department),
        ], 201);
    }


    public function show(Department $department)
    {

        return new DepartmentResource($department);
    }

    public function update(UpdateDepartmentRequest $request, Department $department)
    {
        $department->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Department updated successfully.',
            'data' => new DepartmentResource($department),
        ], 200);
    }

    public function destroy(string $id)
    {
        $department = Department::findOrFail($id);

        if ($department->employees()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete department. Employees are still assigned to this department.'
            ], 409); // 409 Conflict
        }

        $department->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Department deleted successfully.'
        ], 200);
    }
}