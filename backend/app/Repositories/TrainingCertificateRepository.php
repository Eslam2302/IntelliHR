<?php

namespace App\Repositories;

use App\Models\TrainingCertificate;
use App\Repositories\Contracts\TrainingCertificateRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainingCertificateRepository implements TrainingCertificateRepositoryInterface
{
    use FilterQueryTrait;

    /**
     * Constructor to inject model.
     */
    public function __construct(protected TrainingCertificate $model) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('employeeTraining');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_training_id', 'employeeTraining.employee.first_name', 'employeeTraining.employee.last_name', 'employeeTraining.employee.personal_email', 'employeeTraining.training.title'],
            ['id', 'employee_training_id', 'issued_at', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
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
