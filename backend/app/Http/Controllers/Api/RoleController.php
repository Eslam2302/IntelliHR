<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\RoleDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
{
    /**
     * RoleController constructor.
     */
    public function __construct(
        protected RoleService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:roles-manage'),
        ];
    }

    /**
     * Get paginated list of roles.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $roles = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => RoleResource::collection($roles),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
                'last_page' => $roles->lastPage(),
            ],
        ], 200);
    }

    /**
     * Create a new role.
     */
    public function store(RoleRequest $request): JsonResponse
    {
        $dto = RoleDTO::fromRequest($request);
        $role = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Role created successfully',
            'data' => new RoleResource($role),
        ], 201);
    }

    /**
     * Display a specific role.
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new RoleResource($role->load('permissions')),
        ], 200);
    }

    /**
     * Update a specific role.
     */
    public function update(RoleRequest $request, Role $role): JsonResponse
    {
        $dto = RoleDTO::fromRequest($request);
        $updatedRole = $this->service->update($role, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Role updated successfully',
            'data' => new RoleResource($updatedRole),
        ], 200);
    }

    /**
     * Delete a specific role.
     */
    public function destroy(Role $role): JsonResponse
    {
        $this->service->delete($role);

        return response()->json([
            'status' => 'success',
            'message' => 'Role deleted successfully',
        ], 200);
    }
}
