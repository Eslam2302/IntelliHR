<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TrainingCertificateService;
use App\Http\Requests\TrainingCertificateRequest;
use App\DataTransferObjects\TrainingCertificateDTO;
use App\Http\Resources\TrainingCertificateResource;
use App\Models\TrainingCertificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TrainingCertificateController extends Controller implements HasMiddleware
{
    /**
     * Constructor to inject service.
     */
    public function __construct(protected TrainingCertificateService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-training-certificates', only: ['index']),
            new Middleware('permission:view-training-certificate', only: ['show']),
            new Middleware('permission:create-training-certificate', only: ['store']),
            new Middleware('permission:edit-training-certificate', only: ['update']),
            new Middleware('permission:delete-training-certificate', only: ['destroy']),
        ];
    }

    /**
     * List all certificates with pagination.
     */
    public function index(): JsonResponse
    {
        $perPage = request('per_page', 10);
        $certificates = $this->service->getAllPaginated($perPage);

        return response()->json([
            'status' => 'success',
            'data' => TrainingCertificateResource::collection($certificates),
        ]);
    }

    /**
     * Store a newly created certificate.
     */
    public function store(TrainingCertificateRequest $request): JsonResponse
    {
        $dto = TrainingCertificateDTO::fromRequest($request);
        $certificate = $this->service->create($dto);
        $certificate->load('employeeTraining');

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate created successfully',
            'data' => new TrainingCertificateResource($certificate),
        ], 201);
    }

    /**
     * Show a single certificate.
     */
    public function show(TrainingCertificate $certificate): JsonResponse
    {
        $certificate->load('employeeTraining');
        return response()->json([
            'status' => 'success',
            'data' => new TrainingCertificateResource($certificate),
        ]);
    }

    /**
     * Update an existing certificate.
     */
    public function update(TrainingCertificateRequest $request, TrainingCertificate $certificate): JsonResponse
    {
        $dto = TrainingCertificateDTO::fromRequest($request);
        $updated = $this->service->update($certificate, $dto);
        $updated->load('employeeTraining');

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate updated successfully',
            'data' => new TrainingCertificateResource($updated),
        ]);
    }

    /**
     * Delete a certificate.
     */
    public function destroy(TrainingCertificate $certificate): JsonResponse
    {
        $this->service->delete($certificate);

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate deleted successfully',
        ]);
    }
}
