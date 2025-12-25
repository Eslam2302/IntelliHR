<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\JobPostDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostRequest;
use App\Http\Resources\JobPostResource;
use App\Models\JobPost;
use App\Services\JobPostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class JobPostController extends Controller implements HasMiddleware
{
    /**
     * JobPostController constructor.
     */
    public function __construct(
        protected JobPostService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-job-posts', only: ['index']),
            new Middleware('permission:view-job-post', only: ['show']),
            new Middleware('permission:create-job-post', only: ['store']),
            new Middleware('permission:edit-job-post', only: ['update']),
            new Middleware('permission:delete-job-post', only: ['destroy']),
        ];
    }

    /**
     * Get paginated list of job posts.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $jobPosts = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => JobPostResource::collection($jobPosts),
            'meta' => [
                'current_page' => $jobPosts->currentPage(),
                'per_page' => $jobPosts->perPage(),
                'total' => $jobPosts->total(),
                'last_page' => $jobPosts->lastPage(),
            ],
        ], 200);
    }

    /**
     * Create a new job post.
     */
    public function store(jobPostRequest $request): JsonResponse
    {
        $dto = JobPostDto::fromRequest($request);
        $jobPost = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Job Post created successfully',
            'data' => new JobPostResource($jobPost),
        ], 201);
    }

    /**
     * Display a specific job post.
     */
    public function show(JobPost $jobPost): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new JobPostResource($jobPost),
        ], 200);
    }

    /**
     * Update a specific job post.
     */
    public function update(JobPostRequest $request, JobPost $jobPost): JsonResponse
    {
        $dto = JobPostDto::fromRequest($request);
        $updatedJobPost = $this->service->update($jobPost, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Job Post updated successfully',
            'data' => new JobPostResource($updatedJobPost),
        ], 200);
    }

    /**
     * Delete a specific job post.
     */
    public function destroy(JobPost $jobPost): JsonResponse
    {
        $this->service->delete($jobPost);

        return response()->json([
            'status' => 'success',
            'message' => 'Job Post deleted successfully',
        ], 200);
    }
}
