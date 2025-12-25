<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\DocumentDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DocumentController extends Controller implements HasMiddleware
{
    public function __construct(
        protected DocumentService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-documents', only: ['index']),
            new Middleware('permission:view-document', only: ['show']),
            new Middleware('permission:create-document', only: ['store']),
            new Middleware('permission:edit-document', only: ['update']),
            new Middleware('permission:delete-document', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $documents = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => DocumentResource::collection($documents),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
                'last_page' => $documents->lastPage(),
            ],
        ]);
    }

    public function show(Document $document): JsonResponse
    {
        return response()->json(new DocumentResource($document));
    }

    public function getByEmployee(int $employeeId): JsonResponse
    {
        $perPage = request()->get('per_page', 10);

        return response()->json(
            DocumentResource::collection($this->service->getByEmployee($employeeId, $perPage))
        );
    }

    public function store(DocumentRequest $request): JsonResponse
    {
        $dto = DocumentDTO::fromRequest($request);

        $document = $this->service->create($dto);

        return response()->json(new DocumentResource($document), 201);
    }

    public function update(DocumentRequest $request, Document $document): JsonResponse
    {

        $dto = DocumentDTO::fromRequest($request);

        $document = $this->service->update($document, $dto);

        return response()->json(new DocumentResource($document));
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->service->delete($document);

        return response()->json([
            'status' => 'success',
            'message' => 'Document deleted successfully.',
        ], 200);
    }
}
