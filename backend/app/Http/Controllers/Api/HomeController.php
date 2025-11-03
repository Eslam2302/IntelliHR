<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{

    public function index()
    {
        return response()->json([
            'status' => 'success',
            'app_name' => 'IntelliHR AI System',
            'description' => 'A Full-Stack Human Resources Management System (HRMS) built with Laravel and Next.js, featuring AI-powered performance analysis and comprehensive employee lifecycle management.',
            'version' => '1.0.0',
            'next_step' => '/api/login',
        ], 200);
    }
}
