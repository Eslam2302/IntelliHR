<?php

namespace App\Services;

use App\DataTransferObjects\TrainingCertificateDTO;
use App\Models\TrainingCertificate;
use App\Repositories\Contracts\TrainingCertificateRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TrainingCertificateService
{
    /**
     * Constructor to inject repository.
     */
    public function __construct(protected TrainingCertificateRepositoryInterface $repository) {}

    /**
     * Get paginated list of certificates.
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching training certificates: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get certificate by ID.
     */
    public function show(int $id): TrainingCertificate
    {
        try {
            return $this->repository->show($id);
        } catch (\Exception $e) {
            Log::error("Error fetching certificate ID {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new certificate.
     */
    public function create(TrainingCertificateDTO $dto): TrainingCertificate
    {
        try {
            return $this->repository->create($dto->toArray());
        } catch (\Exception $e) {
            Log::error('Error creating training certificate: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing certificate.
     */
    public function update(TrainingCertificate $certificate, TrainingCertificateDTO $dto): TrainingCertificate
    {
        try {
            return $this->repository->update($certificate, $dto->toArray());
        } catch (\Exception $e) {
            Log::error("Error updating certificate ID {$certificate->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a certificate.
     */
    public function delete(TrainingCertificate $certificate): bool
    {
        try {
            return $this->repository->delete($certificate);
        } catch (\Exception $e) {
            Log::error("Error deleting certificate ID {$certificate->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
