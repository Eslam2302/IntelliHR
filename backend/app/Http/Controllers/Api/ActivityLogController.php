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
        $perPage = min((int) $request->input('per_page', 20), 100);
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $allowedSorts = ['id', 'created_at', 'log_name', 'description'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        $query = Activity::query()->orderBy($sort, $direction);

        // Search: action (description), module (log_name), subject type
        if ($request->filled('search')) {
            $term = '%' . trim($request->input('search')) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('description', 'like', $term)
                    ->orWhere('log_name', 'like', $term)
                    ->orWhere('subject_type', 'like', $term);
            });
        }

        // Module filter (exact match)
        if ($request->filled('module')) {
            $query->where('log_name', $request->module);
        }

        // Subject filter
        if ($request->filled('subject_id') && $request->filled('subject_type')) {
            $query->where('subject_type', $request->subject_type)
                ->where('subject_id', $request->subject_id);
        }

        // Employee filter (in properties JSON)
        if ($request->filled('employee_id')) {
            $query->whereJsonContains('properties->employee_id', (int) $request->employee_id);
        }

        return ActivityResource::collection($query->paginate($perPage));
    }
}
