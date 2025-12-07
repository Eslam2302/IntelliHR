<?php

namespace App\Repositories\Contracts;

use App\Models\TrainingCertificate;
use Illuminate\Pagination\LengthAwarePaginator;

interface TrainingCertificateRepositoryInterface
{
    /**
     * Get paginated list of certificates.
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;

    /**
     * Get certificate by ID.
     */
    public function show(int $id): TrainingCertificate;

    /**
     * Create a new certificate.
     */
    public function create(array $data): TrainingCertificate;

    /**
     * Update an existing certificate.
     */
    public function update(TrainingCertificate $certificate, array $data): TrainingCertificate;

    /**
     * Delete a certificate.
     */
    public function delete(TrainingCertificate $certificate): bool;
}
