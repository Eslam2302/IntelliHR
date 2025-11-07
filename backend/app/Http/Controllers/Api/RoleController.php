<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();

        return RoleResource::collection($roles);
    }

    public function show(Role $role)
    {
        $role->load('permissions');

        return new RoleResource($role);
    }


    public function store(RoleRequest $request)
    {
        try {
            DB::beginTransaction();

            $role = Role::create(['name' => $request->name]);

            $role->syncPermissions($request->permissions);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Role '{$role->name}' created successfully.",
            ], 201);

        } catch (\Exception $e) {
    DB::rollBack();
    // 💡 تغيير: إرجاع رسالة الخطأ الفعلية
    return response()->json([
        'status' => 'error',
        'message' => 'Failed to create role.',
        'error_details' => $e->getMessage() // 🔑 هذا هو المفتاح!
    ], 500);
        }
    }

    public function update(RoleRequest $request, Role $role)
    {
        try {
            DB::beginTransaction();

            $role->update(['name' => $request->name]);

            $role->syncPermissions($request->permissions);

            DB::commit();

            $role->load('permissions');

            return response()->json([
                'status' => 'success',
                'message' => "Role '{$role->name}' updated successfully.",
                'data' => new RoleResource($role)
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Failed to update role.'], 500);
        }
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return response()->json(['status' => 'success', 'message' => 'Role deleted successfully.'], 204);
    }

    public function indexPermissions()
    {
        $permissions = Permission::all()->pluck('name');

        return response()->json(['permissions' => $permissions]);
    }
}
