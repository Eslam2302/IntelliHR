<?php

namespace App\Repositories;

use App\Models\Document;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class DocumentRepository implements DocumentRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Document $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        $query = $this->applyFilters(
            $query,
            $filters,
            ['doc_type'],
            ['id', 'doc_type', 'created_at', 'updated_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
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
