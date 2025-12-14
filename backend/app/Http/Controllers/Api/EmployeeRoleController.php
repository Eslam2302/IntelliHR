<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignRoleRequest;
use App\Services\EmployeeRoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use App\Models\Employee;
use App\DataTransferObjects\AssignRoleDTO;

class EmployeeRoleController extends Controller implements HasMiddleware
{
    public function __construct(
        protected EmployeeRoleService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:assign-roles'),
        ];
    }

    /**
     * Assign role to employee.
     */
    public function assign(AssignRoleRequest $request, Employee $employee): JsonResponse
    {
        $dto = AssignRoleDTO::fromRequest($request);
        $employee = $this->service->assign($employee, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Role assigned successfully',
            'data' => [
                'employee_id' => $employee->id,
                'roles' => $employee->roles->pluck('name'),
                'permissions' => $employee->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}
