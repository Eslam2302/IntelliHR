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
        $request->validate([
            'employee_id' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('employee_id', 'password'))) {
            return response()->json([
                'message' => 'Invalid Employee ID or password.'
            ], 401);
        }

        $user = User::where('employee_id', $request->employee_id)->firstOrFail();

        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'user' => [
                'id' => $user->employee_id,
                'role' => $user->role,
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