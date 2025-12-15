<?php

namespace App\Repositories;

use App\Models\Document;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class DocumentRepository implements DocumentRepositoryInterface
{
    public function __construct(
        protected Document $model
    ) {}

    public function all(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perPage);
    }

    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->latest()
            ->paginate($perPage);
    }

    public function find(int $id): ?Document
    {
        return $this->model->find($id);
    }

    public function create(array $data): Document
    {
        return $this->model->create($data);
    }

    public function update(Document $document, array $data): Document
    {
        $document->update($data);
        return $document->fresh();
    }

    public function delete(Document $document): bool
    {
        return $document->delete();
    }
}