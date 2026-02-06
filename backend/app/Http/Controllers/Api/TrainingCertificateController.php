<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\TrainingCertificateDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrainingCertificateRequest;
use App\Http\Resources\TrainingCertificateResource;
use App\Models\TrainingCertificate;
use App\Services\TrainingCertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            new Middleware('permission:create-training-certificate', only: ['store', 'upload']),
            new Middleware('permission:edit-training-certificate', only: ['update', 'upload']),
            new Middleware('permission:delete-training-certificate', only: ['destroy']),
        ];
    }

    /**
     * Upload a certificate file. Returns the stored path for use in create/update.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'certificate_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ], [
            'certificate_file.required' => 'Please select a file to upload.',
            'certificate_file.file' => 'The uploaded value must be a file.',
            'certificate_file.mimes' => 'The file must be a PDF or image (jpg, jpeg, png).',
            'certificate_file.max' => 'The file must not exceed 5 MB.',
        ]);

        $file = $request->file('certificate_file');
        $path = $file->store('certificates', 'public');

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate file uploaded.',
            'path' => $path,
        ], 200);
    }

    /**
     * List all certificates with pagination.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $certificates = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => TrainingCertificateResource::collection($certificates),
            'meta' => [
                'current_page' => $certificates->currentPage(),
                'per_page' => $certificates->perPage(),
                'total' => $certificates->total(),
                'last_page' => $certificates->lastPage(),
            ],
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
        $certificate->load(['employeeTraining.employee', 'employeeTraining.training']);

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
