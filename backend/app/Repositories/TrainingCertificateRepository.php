<?php

namespace App\Repositories;

use App\Models\TrainingCertificate;
use App\Repositories\Contracts\TrainingCertificateRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainingCertificateRepository implements TrainingCertificateRepositoryInterface
{
    /**
     * Constructor to inject model.
     */
    public function __construct(protected TrainingCertificate $model) {}

    /**
     * Get paginated list of certificates.
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with('employeeTraining')->latest()->paginate($perPage);
    }

    /**
     * Get certificate by ID.
     */
    public function show(int $id): TrainingCertificate
    {
        return $this->model->with('employeeTraining')->findOrFail($id);
    }

    /**
     * Create a new certificate.
     */
    public function create(array $data): TrainingCertificate
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing certificate.
     */
    public function update(TrainingCertificate $certificate, array $data): TrainingCertificate
    {
        $certificate->update($data);
        return $certificate->fresh();
    }

    /**
     * Delete a certificate.
     */
    public function delete(TrainingCertificate $certificate): bool
    {
        return $certificate->delete();
    }
}