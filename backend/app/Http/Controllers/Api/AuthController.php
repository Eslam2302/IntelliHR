<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;


class AuthController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'employee_id' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['employee_id' => $credentials['employee_id'], 'password' => $credentials['password']])) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('employee_id', $request->employee_id)->first();
        
        $token = $user->createToken('access_token')->plainTextToken;

        $roleName = $user->getRoleNames()->first();

        $permissions = $user->getAllPermissions()->pluck('name');

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'user' => [
                'id' => $user->employee_id,
                'role'  => $roleName,
                'permissions' => $permissions,
            ],
            'token' => $token
        ], 200);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out.'
        ], 200);
    }
}
