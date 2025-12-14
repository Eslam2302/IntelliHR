<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApplicantService;
use Illuminate\Http\JsonResponse;
use App\DataTransferObjects\ApplicantDTO;
use App\Http\Requests\ApplicantRequest;
use App\Http\Resources\ApplicantResource;
use App\Models\Applicant;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ApplicantController extends Controller implements HasMiddleware
{
    public function __construct(protected ApplicantService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-applicants', only: ['index','getByJobPost']),
            new Middleware('permission:view-applicant', only: ['show']),
            new Middleware('permission:create-applicant', only: ['store']),
            new Middleware('permission:edit-applicant', only: ['update']),
            new Middleware('permission:delete-applicant', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $perPage = request('per_page', 10);
        $applicants = $this->service->getAllPaginated($perPage);

        return response()->json([
            'status' => 'success',
            'data' => ApplicantResource::collection($applicants),
        ]);
    }

    public function store(ApplicantRequest $request): JsonResponse
    {
        $dto = ApplicantDTO::fromRequest($request);
        $applicant = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Applicant created successfully',
            'data' => new ApplicantResource($applicant),
        ], 201);
    }

    public function show(Applicant $applicant): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new ApplicantResource($applicant),
        ]);
    }

    public function update(ApplicantRequest $request, Applicant $applicant): JsonResponse
    {
        $dto = ApplicantDTO::fromRequest($request);
        $updated = $this->service->update($applicant, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Applicant updated successfully',
            'data' => new ApplicantResource($updated),
        ]);
    }

    public function destroy(Applicant $applicant): JsonResponse
    {
        $this->service->delete($applicant);

        return response()->json([
            'status' => 'success',
            'message' => 'Applicant deleted successfully',
        ]);
    }

    public function getByJobPost(int $jobPostId): JsonResponse
    {
        $applicants = $this->service->getByJobPost($jobPostId);

        return response()->json([
            'status' => 'success',
            'data' => ApplicantResource::collection($applicants),
        ]);
    }
}