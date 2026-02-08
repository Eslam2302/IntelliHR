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
            new Middleware('permission:edit-performance-review', only: ['update', 'submitSelfAssessment', 'submitManagerReview', 'startSelfAssessment', 'startManagerReview', 'acknowledgeReview', 'completeReview']),
            new Middleware('permission:delete-performance-review', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        // Load user's employee relationship for metadata checks
        $request = request();
        if ($request->user() && !$request->user()->relationLoaded('employee')) {
            $request->user()->load('employee');
        }

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
        // Load user's employee relationship for metadata checks
        $request = request();
        if ($request->user() && !$request->user()->relationLoaded('employee')) {
            $request->user()->load('employee');
        }

        return response()->json([
            'status' => 'success',
            'data' => new PerformanceReviewResource($performanceReview->load([
                'evaluationCycle',
                'employee',
                'reviewer',
                'ratings.competency'
            ])),
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

    public function submitSelfAssessment(PerformanceReviewRequest $request, PerformanceReview $performanceReview): JsonResponse
    {
        $selfAssessmentData = $request->only([
            'self_assessment_summary',
            'self_assessment_achievements',
            'self_assessment_challenges',
            'self_assessment_goals',
        ]);

        // Normalize field names
        $data = [
            'summary' => $selfAssessmentData['self_assessment_summary'] ?? null,
            'achievements' => $selfAssessmentData['self_assessment_achievements'] ?? [],
            'challenges' => $selfAssessmentData['self_assessment_challenges'] ?? [],
            'goals' => $selfAssessmentData['self_assessment_goals'] ?? [],
        ];

        $updatedPerformanceReview = $this->performanceReviewService->submitSelfAssessment($performanceReview, $data);

        return response()->json([
            'status' => 'success',
            'message' => 'Self-assessment submitted successfully.',
            'data' => new PerformanceReviewResource($updatedPerformanceReview),
        ], 200);
    }

    public function submitManagerReview(PerformanceReviewRequest $request, PerformanceReview $performanceReview): JsonResponse
    {
        $managerReviewData = $request->only([
            'manager_summary',
            'manager_strengths',
            'manager_areas_for_improvement',
            'manager_goals_for_next_period',
            'manager_additional_comments',
            'overall_rating',
            'overall_score',
            'promotion_recommended',
            'salary_increase_percentage',
            'bonus_amount',
            'recommended_training',
            'development_plan',
        ]);

        // Normalize field names
        $data = [
            'summary' => $managerReviewData['manager_summary'] ?? null,
            'strengths' => $managerReviewData['manager_strengths'] ?? [],
            'areas_for_improvement' => $managerReviewData['manager_areas_for_improvement'] ?? [],
            'goals_for_next_period' => $managerReviewData['manager_goals_for_next_period'] ?? [],
            'additional_comments' => $managerReviewData['manager_additional_comments'] ?? null,
            'overall_rating' => $managerReviewData['overall_rating'] ?? null,
            'overall_score' => $managerReviewData['overall_score'] ?? null,
            'promotion_recommended' => $managerReviewData['promotion_recommended'] ?? false,
            'salary_increase_percentage' => $managerReviewData['salary_increase_percentage'] ?? null,
            'bonus_amount' => $managerReviewData['bonus_amount'] ?? null,
            'recommended_training' => $managerReviewData['recommended_training'] ?? [],
            'development_plan' => $managerReviewData['development_plan'] ?? [],
        ];

        $updatedPerformanceReview = $this->performanceReviewService->submitManagerReview($performanceReview, $data);

        return response()->json([
            'status' => 'success',
            'message' => 'Manager review submitted successfully.',
            'data' => new PerformanceReviewResource($updatedPerformanceReview),
        ], 200);
    }

    public function startSelfAssessment(PerformanceReview $performanceReview): JsonResponse
    {
        $updatedPerformanceReview = $this->performanceReviewService->startSelfAssessment($performanceReview);

        return response()->json([
            'status' => 'success',
            'message' => 'Self-assessment started.',
            'data' => new PerformanceReviewResource($updatedPerformanceReview),
        ], 200);
    }

    public function startManagerReview(PerformanceReview $performanceReview): JsonResponse
    {
        $updatedPerformanceReview = $this->performanceReviewService->startManagerReview($performanceReview);

        return response()->json([
            'status' => 'success',
            'message' => 'Manager review started.',
            'data' => new PerformanceReviewResource($updatedPerformanceReview),
        ], 200);
    }

    public function acknowledgeReview(PerformanceReviewRequest $request, PerformanceReview $performanceReview): JsonResponse
    {
        $comments = $request->input('employee_acknowledgment_comments');
        $updatedPerformanceReview = $this->performanceReviewService->acknowledgeReview($performanceReview, $comments);

        return response()->json([
            'status' => 'success',
            'message' => 'Performance review acknowledged successfully.',
            'data' => new PerformanceReviewResource($updatedPerformanceReview),
        ], 200);
    }

    public function completeReview(PerformanceReview $performanceReview): JsonResponse
    {
        $updatedPerformanceReview = $this->performanceReviewService->completeReview($performanceReview);

        return response()->json([
            'status' => 'success',
            'message' => 'Performance review completed successfully.',
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

