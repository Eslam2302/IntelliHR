<?php

namespace App\Services;

use App\DataTransferObjects\DocumentDTO;
use App\Models\Document;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class DocumentService

{
    public function __construct(
        protected DocumentRepositoryInterface $repository
    ) {}

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->all($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching documents: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getByEmployee($employeeId, $perPage);
        } catch (\Exception $e) {
            Log::error("Error fetching documents for employee {$employeeId}: " . $e->getMessage());
            throw $e;
        }
    }

    public function findById(int $id): ?Document
    {
        try {
            return $this->repository->find($id);
        } catch (\Exception $e) {
            Log::error("Error finding document {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function create(DocumentDTO $dto): Document
    {
        try {

            // Upload file
            $filePath = $dto->attachment
                ? $dto->attachment->store('documents', 'public')
                : null;

            $data = [
                'employee_id' => $dto->employee_id,
                'doc_type'    => $dto->doc_type,
                'file_path'   => $filePath,
                'uploaded_at' => now(),
            ];

            return $this->repository->store($data);
        } catch (\Exception $e) {
            Log::error('Error creating document: ' . $e->getMessage());
            throw $e;
        }
    }

    public function update(int $id, DocumentDTO $dto): Document
    {
        try {
            $document = $this->repository->find($id);

            $filePath = $document->file_path; // keep old file
            $docType    = $dto->doc_type ?? $document->doc_type;

            Log::info("Update Document {$id}", [
                'dto_doc_type' => $dto->doc_type,
                'document_doc_type' => $document->doc_type,
                'final_doc_type' => $docType,
            ]);

            // If new file uploaded → replace old
            if ($dto->attachment) {
                $filePath = $dto->attachment->store('documents', 'public');
            }

            $data = [
                'employee_id' => $dto->employee_id ?? $document->employee_id,
                'doc_type'    => $docType,
                'file_path'   => $filePath,
                'uploaded_at' => $dto->attachment ? now() : $document->uploaded_at,
            ];

            Log::info("Data to update", $data);

            return $this->repository->update($id, $data);
        } catch (\Exception $e) {
            Log::error("Error updating document {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function delete(int $id): bool
    {
        try {
            return $this->repository->delete($id);
        } catch (\Exception $e) {
            Log::error("Error deleting document {$id}: " . $e->getMessage());
            throw $e;
        }
    }
}