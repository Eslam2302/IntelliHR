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

    public function update(Document $document, DocumentDTO $dto): Document
    {
        try {

            // 1. If a new file is uploaded → store it
            if ($dto->attachment) {
                $filePath = $dto->attachment->store('documents', 'public');
            } else {
                // keep the old file
                $filePath = $document->file_path;
            }


            // 2. Create the update data
            $data = [
                'employee_id' => $dto->employee_id ?? $document->employee_id,
                'doc_type'    => $dto->doc_type    ?? $document->doc_type,
                'file_path'   => $filePath,
                'uploaded_at' => $dto->attachment ? now() : $document->uploaded_at,
            ];

            // 3. Update using repository
            $updated = $this->repository->update($document, $data);
            Log::info("Document updated successfully", [
                'id' => $updated->id,
                'employee_id' => $updated->employee_id,
                'doc_type' => $updated->doc_type,
                'file_path' => $updated->file_path,
            ]);

            return $updated;
        } catch (\Exception $e) {
            Log::error("Error updating document {$document->id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function delete(Document $document): bool
    {
        try {
            return $this->repository->delete($document);
        } catch (\Exception $e) {
            Log::error("Error deleting document " . $e->getMessage());
            throw $e;
        }
    }
}
