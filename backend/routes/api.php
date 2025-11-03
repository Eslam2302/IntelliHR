<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\AuthController;

Route::get('home', [HomeController::class, 'index']);

Route::post('login', [AuthController::class, 'store']);

// (Protected Routes)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
    return $request->user();
    });

    Route::post('logout', [AuthController::class, 'destroy']);

    // APIs
    

});
