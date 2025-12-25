<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\EmployeeTrainingDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\EmployeeTrainingRequest;
use App\Http\Resources\EmployeeTrainingResource;
use App\Models\EmployeeTraining;
use App\Services\EmployeeTrainingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EmployeeTrainingController extends Controller implements HasMiddleware
{
    /**
     * Constructor.
     */
    public function __construct(protected EmployeeTrainingService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-employee-trainings', only: ['index']),
            new Middleware('permission:view-employee-training', only: ['show']),
            new Middleware('permission:create-employee-training', only: ['store']),
            new Middleware('permission:edit-employee-training', only: ['update']),
            new Middleware('permission:delete-employee-training', only: ['destroy']),
        ];
    }

    /**
     * Display paginated list of employee trainings.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $trainings = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => EmployeeTrainingResource::collection($trainings),
            'meta' => [
                'current_page' => $trainings->currentPage(),
                'per_page' => $trainings->perPage(),
                'total' => $trainings->total(),
                'last_page' => $trainings->lastPage(),
            ],
        ], 200);
    }

    /**
     * Store a newly created employee training.
     */
    public function store(EmployeeTrainingRequest $request): JsonResponse
    {
        $dto = EmployeeTrainingDTO::fromRequest($request);
        $training = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee training created successfully',
            'data' => new EmployeeTrainingResource($training),
        ], 201);
    }

    /**
     * Display a single employee training.
     */
    public function show(EmployeeTraining $employeeTraining): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new EmployeeTrainingResource($employeeTraining->load(['employee', 'training'])),
        ], 200);
    }

    /**
     * Update an existing employee training.
     */
    public function update(EmployeeTrainingRequest $request, EmployeeTraining $employeeTraining): JsonResponse
    {
        $dto = EmployeeTrainingDTO::fromRequest($request);
        $updatedTraining = $this->service->update($employeeTraining, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee training updated successfully',
            'data' => new EmployeeTrainingResource($updatedTraining),
        ], 200);
    }

    /**
     * Delete an employee training.
     */
    public function destroy(EmployeeTraining $employeeTraining): JsonResponse
    {
        $this->service->delete($employeeTraining);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee training deleted successfully',
        ], 200);
    }
}
