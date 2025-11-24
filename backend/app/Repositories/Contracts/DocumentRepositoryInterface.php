<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Document;

interface DocumentRepositoryInterface
{
    /**
     * Get all documents with pagination.
     *
     * @param int $perPage Number of items per page.
     * @return LengthAwarePaginator
     */
    public function all(int $perPage = 10): LengthAwarePaginator;

    /**
     * Get all documents that belong to a specific employee.
     *
     * @param int $employeeId The ID of the employee.
     * @param int $perPage Number of items per page.
     * @return LengthAwarePaginator
     */
    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator;

    /**
     * Find a single document by its ID.
     *
     * @param int $id Document ID.
     * @return Document|null
     */
    public function find(int $id): ?Document;

    /**
     * Store a new document record.
     *
     * @param array $data Validated document data.
     * @return Document
     */
    public function store(array $data): Document;

    /**
     * Update an existing document record.
     *
     * @param int $id Document ID.
     * @param array $data Updated data.
     * @return Document
     */
    public function update(Document $document, array $data): Document;

    /**
     * Delete a document by its ID.
     *
     * @param int $id Document ID.
     * @return bool
     */
    public function delete(Document $document): bool;
}
