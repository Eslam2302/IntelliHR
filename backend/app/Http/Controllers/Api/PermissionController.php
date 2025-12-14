<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\RolePermissionDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\RolePermissionRequest;
use App\Services\RolePermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller implements HasMiddleware
{
    public function __construct(
        protected RolePermissionService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:roles-manage'),
        ];
    }

    /**
     * Get permissions for a specific role.
     */
    public function index(Role $role): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->service->get($role),
        ]);
    }

    /**
     * Sync permissions with role.
     */
    public function sync(RolePermissionRequest $request, Role $role): JsonResponse
    {
        $dto = RolePermissionDTO::fromRequest($request);
        $role = $this->service->sync($role, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Permissions synced successfully',
            'data' => $role->permissions,
        ]);
    }
}
