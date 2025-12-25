<?php

namespace App\Repositories\Contracts;

use App\Models\Document;
use Illuminate\Pagination\LengthAwarePaginator;

interface DocumentRepositoryInterface
{
    /**
     * Get all documents with pagination.
     *
     * @param  array  $filters  Filter parameters.
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Get all documents that belong to a specific employee.
     *
     * @param  int  $employeeId  The ID of the employee.
     * @param  int  $perPage  Number of items per page.
     */
    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator;

    /**
     * Find a single document by its ID.
     *
     * @param  int  $id  Document ID.
     */
    public function find(int $id): ?Document;

    /**
     * Store a new document record.
     *
     * @param  array  $data  Validated document data.
     */
    public function create(array $data): Document;

    /**
     * Update an existing document record.
     *
     * @param  int  $id  Document ID.
     * @param  array  $data  Updated data.
     */
    public function update(Document $document, array $data): Document;

    /**
     * Delete a document by its ID.
     *
     * @param  int  $id  Document ID.
     */
    public function delete(Document $document): bool;
}
