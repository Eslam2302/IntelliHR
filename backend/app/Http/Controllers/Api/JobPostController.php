<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\JobPostService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\DataTransferObjects\JobPostDto;
use App\Http\Resources\JobPostResource;
use App\Http\Requests\JobPostRequest;
use App\Models\JobPost;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class JobPostController extends Controller implements HasMiddleware
{
    /**
     * JobPostController constructor.
     *
     * @param JobPostService $service
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
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perPage = request('per_page', 10);
        $jobPosts = $this->service->getAllPaginated($perPage);

        return response()->json([
            'status' => 'success',
            'data' => JobPostResource::collection($jobPosts),
        ], 200);
    }

    /**
     * Create a new job post.
     *
     * @param jobPostRequest $request
     * @return JsonResponse
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
     *
     * @param JobPost $jobPost
     * @return JsonResponse
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
     *
     * @param JobPostRequest $request
     * @param JobPost $jobPost
     * @return JsonResponse
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
     *
     * @param JobPost $jobPost
     * @return JsonResponse
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
