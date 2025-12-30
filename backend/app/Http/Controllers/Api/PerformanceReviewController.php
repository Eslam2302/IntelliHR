<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\PerformanceReviewDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\PerformanceReviewRequest;
use App\Http\Resources\PerformanceReviewResource;
use App\Models\PerformanceReview;
use App\Services\PerformanceReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PerformanceReviewController extends Controller implements HasMiddleware
{
    public function __construct(protected PerformanceReviewService $performanceReviewService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-performance-reviews', only: ['index']),
            new Middleware('permission:view-performance-review', only: ['show']),
            new Middleware('permission:create-performance-review', only: ['store']),
            new Middleware('permission:edit-performance-review', only: ['update']),
            new Middleware('permission:delete-performance-review', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $performanceReviews = $this->performanceReviewService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => PerformanceReviewResource::collection($performanceReviews),
            'meta' => [
                'current_page' => $performanceReviews->currentPage(),
                'per_page' => $performanceReviews->perPage(),
                'total' => $performanceReviews->total(),
                'last_page' => $performanceReviews->lastPage(),
            ],
        ]);
    }

    public function store(PerformanceReviewRequest $request): JsonResponse
    {
        $dto = PerformanceReviewDTO::fromRequest($request);
        $performanceReview = $this->performanceReviewService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Performance review created successfully.',
            'data' => new PerformanceReviewResource($performanceReview),
        ], 201);
    }

    public function show(PerformanceReview $performanceReview): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new PerformanceReviewResource($performanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings'])),
        ], 200);
    }

    public function update(PerformanceReviewRequest $request, PerformanceReview $performanceReview): JsonResponse
    {
        $dto = PerformanceReviewDTO::fromRequestForUpdate($request, $performanceReview);
        $updatedPerformanceReview = $this->performanceReviewService->update($performanceReview, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Performance review updated successfully.',
            'data' => new PerformanceReviewResource($updatedPerformanceReview),
        ], 200);
    }

    public function destroy(PerformanceReview $performanceReview): JsonResponse
    {
        $this->performanceReviewService->delete($performanceReview);

        return response()->json([
            'status' => 'success',
            'message' => 'Performance review deleted successfully.',
        ], 200);
    }
}

