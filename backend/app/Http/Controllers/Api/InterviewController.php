<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\InterviewDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\InterviewRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Interview;
use App\Services\InterviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class InterviewController extends Controller implements HasMiddleware
{
    public function __construct(protected InterviewService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-interviews', only: ['index']),
            new Middleware('permission:view-interview', only: ['show']),
            new Middleware('permission:create-interview', only: ['store']),
            new Middleware('permission:edit-interview', only: ['update']),
            new Middleware('permission:delete-interview', only: ['destroy']),
        ];
    }

    /**
     * Get paginated list of interviews.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $interviews = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => InterviewResource::collection($interviews),
            'meta' => [
                'current_page' => $interviews->currentPage(),
                'per_page' => $interviews->perPage(),
                'total' => $interviews->total(),
                'last_page' => $interviews->lastPage(),
            ],
        ], 200);
    }

    /**
     * Create a new interview.
     */
    public function store(InterviewRequest $request): JsonResponse
    {
        $dto = InterviewDTO::fromRequest($request);
        $interview = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Interview created successfully',
            'data' => new InterviewResource($interview),
        ], 201);
    }

    /**
     * Show a specific interview.
     *
     * @param  Interview  $interview
     */
    public function show(int $interviewId): JsonResponse
    {
        $interview = $this->service->show($interviewId);

        return response()->json([
            'status' => 'success',
            'data' => new InterviewResource($interview),
        ], 200);
    }

    /**
     * Update a specific interview.
     */
    public function update(InterviewRequest $request, Interview $interview): JsonResponse
    {
        $dto = InterviewDTO::fromRequest($request);
        $updated = $this->service->update($interview, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Interview updated successfully',
            'data' => new InterviewResource($updated),
        ], 200);
    }

    /**
     * Delete a specific interview.
     */
    public function destroy(Interview $interview): JsonResponse
    {
        $this->service->delete($interview);

        return response()->json([
            'status' => 'success',
            'message' => 'Interview deleted successfully',
        ], 200);
    }
}
