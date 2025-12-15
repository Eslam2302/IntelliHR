<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::query()->latest();

        // Model Filtering
        if ($request->filled('module')) {
            $query->where('log_name', $request->module);
        }

        // Subject Filtering (Model)
        if ($request->filled('subject_id') && $request->filled('subject_type')) {
            $query->where('subject_type', $request->subject_type)
                ->where('subject_id', $request->subject_id);
        }

        // Employee Filtering
        if ($request->filled('employee_id')) {
            $query->whereJsonContains('properties->employee_id', (int) $request->employee_id);
        }

        return ActivityResource::collection($query->paginate(20));
    }
}
