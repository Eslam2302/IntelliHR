<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ReviewRatingDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRatingRequest;
use App\Http\Resources\ReviewRatingResource;
use App\Models\ReviewRating;
use App\Services\ReviewRatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ReviewRatingController extends Controller implements HasMiddleware
{
    public function __construct(protected ReviewRatingService $reviewRatingService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-review-ratings', only: ['index']),
            new Middleware('permission:view-review-rating', only: ['show']),
            new Middleware('permission:create-review-rating', only: ['store']),
            new Middleware('permission:edit-review-rating', only: ['update']),
            new Middleware('permission:delete-review-rating', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['performance_review_id', 'competency_id']);
        $reviewRatings = $this->reviewRatingService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => ReviewRatingResource::collection($reviewRatings),
        ], 200);
    }

    public function store(ReviewRatingRequest $request): JsonResponse
    {
        $dto = ReviewRatingDTO::fromRequest($request);
        $reviewRating = $this->reviewRatingService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Review rating created successfully.',
            'data' => new ReviewRatingResource($reviewRating),
        ], 201);
    }

    public function show(ReviewRating $reviewRating): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new ReviewRatingResource($reviewRating->load(['performanceReview', 'competency'])),
        ], 200);
    }

    public function update(ReviewRatingRequest $request, ReviewRating $reviewRating): JsonResponse
    {
        $dto = ReviewRatingDTO::fromRequest($request);
        $updatedReviewRating = $this->reviewRatingService->update($reviewRating, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Review rating updated successfully.',
            'data' => new ReviewRatingResource($updatedReviewRating),
        ], 200);
    }

    public function destroy(ReviewRating $reviewRating): JsonResponse
    {
        $this->reviewRatingService->delete($reviewRating);

        return response()->json([
            'status' => 'success',
            'message' => 'Review rating deleted successfully.',
        ], 200);
    }
}

