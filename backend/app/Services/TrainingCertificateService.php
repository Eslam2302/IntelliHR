<?php

namespace App\Services;

use App\DataTransferObjects\TrainingCertificateDTO;
use App\Models\TrainingCertificate;
use App\Repositories\Contracts\TrainingCertificateRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Exception;

class TrainingCertificateService
{
    /**
     * Constructor to inject repository.
     */
    public function __construct(
        protected TrainingCertificateRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Get paginated list of certificates.
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (Exception $e) {
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
        } catch (Exception $e) {
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
            $certificate = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'trainingCertificate',
                description: 'training_certificate_created',
                subject: $certificate,
                properties: [
                    'employee_training_id' => $certificate->employee_training_id,
                    'issued_at' => $certificate->issued_at,
                    'certificate_path' => $certificate->certificate_path,
                ]
            );

            Log::info("Training Certificate created successfully", [
                'id' => $certificate->id,
                'employee_training_id' => $certificate->employee_training_id,
            ]);

            return $certificate;
        } catch (Exception $e) {
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
            $oldData = $certificate->only([
                'employee_training_id',
                'issued_at',
                'certificate_path',
            ]);

            $updatedCertificate = $this->repository->update($certificate, $dto->toArray());

            $this->activityLogger->log(
                logName: 'trainingCertificate',
                description: 'training_certificate_updated',
                subject: $updatedCertificate,
                properties: [
                    'before' => $oldData,
                    'after'  => $updatedCertificate->only([
                        'employee_training_id',
                        'issued_at',
                        'certificate_path',
                    ]),
                ]
            );

            Log::info("Training Certificate updated successfully", [
                'id' => $updatedCertificate->id,
                'employee_training_id' => $updatedCertificate->employee_training_id,
            ]);

            return $updatedCertificate;
        } catch (Exception $e) {
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
            $data = $certificate->only([
                'employee_training_id',
                'issued_at',
                'certificate_path',
            ]);

            $deleted = $this->repository->delete($certificate);

            $this->activityLogger->log(
                logName: 'trainingCertificate',
                description: 'training_certificate_deleted',
                subject: $certificate,
                properties: $data
            );

            Log::info("Training Certificate deleted successfully", [
                'id' => $certificate->id,
                'employee_training_id' => $certificate->employee_training_id,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting certificate ID {$certificate->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
