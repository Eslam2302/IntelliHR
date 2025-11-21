<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Http\Resources\DocumentResource;
use App\DataTransferObjects\DocumentDTO;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentService $service
    ) {}

    public function index(): JsonResponse
    {
        $perPage = request()->get('per_page', 10);

        return response()->json(
            DocumentResource::collection($this->service->getAllPaginated($perPage))
        );
    }

    public function show(int $id): JsonResponse
    {
        $document = $this->service->findById($id);

        if (!$document) {
            return response()->json(['message' => 'Document not found'], 404);
        }

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

    public function update(DocumentRequest $request, int $id): JsonResponse
    {
        $dto = DocumentDTO::fromRequest($request);

        $document = $this->service->update($id, $dto);

        return response()->json(new DocumentResource($document));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(['message' => 'Document deleted']);
    }
}
