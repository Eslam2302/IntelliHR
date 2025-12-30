<?php

namespace App\Services;

use App\DataTransferObjects\CompetencyDTO;
use App\Models\Competency;
use App\Repositories\Contracts\CompetencyRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompetencyService
{
    public function __construct(
        protected CompetencyRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching competencies: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(CompetencyDTO $dto): Competency
    {
        try {
            DB::beginTransaction();

            $competency = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'competency',
                description: 'competency_created',
                subject: $competency,
                properties: [
                    'name' => $competency->name,
                    'category' => $competency->category,
                    'applicable_to' => $competency->applicable_to,
                    'weight' => $competency->weight,
                ]
            );

            DB::commit();

            Log::info('Competency created successfully', ['id' => $competency->id, 'name' => $competency->name]);

            return $competency;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating competency: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(Competency $competency, CompetencyDTO $dto): Competency
    {
        try {
            DB::beginTransaction();

            $oldData = $competency->only([
                'name',
                'category',
                'applicable_to',
                'weight',
                'is_active',
            ]);

            $updateData = $dto->toUpdateArray();
            $updatedCompetency = $this->repository->update($competency, $updateData);

            $this->activityLogger->log(
                logName: 'competency',
                description: 'competency_updated',
                subject: $updatedCompetency,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedCompetency->only([
                        'name',
                        'category',
                        'applicable_to',
                        'weight',
                        'is_active',
                    ]),
                ]
            );

            DB::commit();

            Log::info('Competency updated successfully', ['id' => $competency->id, 'name' => $competency->name]);

            return $updatedCompetency;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating competency {$competency->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(Competency $competency): bool
    {
        try {
            DB::beginTransaction();

            $data = $competency;

            $deleted = $this->repository->delete($competency);

            $this->activityLogger->log(
                logName: 'competency',
                description: 'competency_deleted',
                subject: $competency,
                properties: [$data]
            );

            DB::commit();

            Log::info('Competency deleted successfully', ['id' => $competency->id, 'name' => $competency->name]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting competency {$competency->id}: ".$e->getMessage());
            throw $e;
        }
    }
}

