<?php

namespace App\Services;

use App\DataTransferObjects\ApplicantDTO;
use App\Jobs\ProcessResumeAnalysisJob;
use App\Models\Applicant;
use App\Repositories\Contracts\ApplicantRepositoryInterface;
use App\Services\OpenAI\ResumeAnalysisService;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ApplicantService
{
    public function __construct(
        protected ApplicantRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger,
        protected ResumeAnalysisService $resumeAnalysisService
    ) {}

    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching Applicants: '.$e->getMessage());
            throw $e;
        }
    }

    public function show(int $applicantId): Applicant
    {
        try {
            return $this->repository->show($applicantId);
        } catch (Exception $e) {
            Log::error("Error fetching Applicant ID {$applicantId}: ".$e->getMessage());
            throw $e;
        }
    }

    public function create(ApplicantDTO $dto): Applicant
    {
        try {
            $data = $dto->toArray();

            // Handle resume file upload if provided
            if (request()->hasFile('resume')) {
                $resumeFile = request()->file('resume');
                $data['resume_path'] = $resumeFile->store('resumes', 'public');
            }

            if (empty($data['current_stage_id'])) {
                $firstStage = \App\Models\JobPost::findOrFail($data['job_id'])
                    ->hiringStages()
                    ->orderBy('order')
                    ->first();

                $data['current_stage_id'] = $firstStage?->id;
            }

            $applicant = $this->repository->create($data);

            $this->activityLogger->log(
                logName: 'applicant',
                description: 'applicant_created',
                subject: $applicant,
                properties: [
                    'first_name' => $applicant->first_name,
                    'last_name' => $applicant->last_name,
                    'email' => $applicant->email,
                    'phone' => $applicant->phone,
                    'job_id' => $applicant->job_id,
                    'status' => $applicant->status,
                    'is_employee' => $applicant->is_employee,
                    'source' => $applicant->source,
                    'experience_years' => $applicant->experience_years,
                    'current_stage_id' => $applicant->current_stage_id,
                ]
            );

            Log::info('Applicant created successfully', [
                'id' => $applicant->id,
                'name' => $applicant->first_name.' '.$applicant->last_name,
                'job_id' => $applicant->job_id,
                'current_stage_id' => $applicant->current_stage_id,
            ]);

            // Auto-analyze resume if enabled and resume exists
            if (config('openai.resume_analysis.auto_analyze', true) && !empty($applicant->resume_path)) {
                $applicant->update(['ai_analysis_status' => 'pending']);
                
                // Run synchronously if queue connection is 'sync' or in development, otherwise dispatch to queue
                $queueConnection = config('queue.default');
                $isDevelopment = config('app.env') === 'local' || config('app.debug');
                
                if ($queueConnection === 'sync' || $isDevelopment) {
                    // Run with retry logic for synchronous execution
                    $this->runResumeAnalysisWithRetry($applicant->id);
                } else {
                    // Dispatch to queue for production (will use job retry logic)
                    ProcessResumeAnalysisJob::dispatch($applicant->id);
                }
            }

            return $applicant;
        } catch (Exception $e) {
            Log::error('Error creating Applicant: '.$e->getMessage());
            throw $e;
        }
    }

    public function update(Applicant $applicant, ApplicantDTO $dto): Applicant
    {
        try {
            $oldData = $applicant->only([
                'first_name',
                'last_name',
                'email',
                'phone',
                'job_id',
                'status',
                'is_employee',
                'source',
                'experience_years',
                'current_stage_id',
            ]);

            $updated = $this->repository->update($applicant, $dto->toUpdateArray());

            $this->activityLogger->log(
                logName: 'applicant',
                description: 'applicant_updated',
                subject: $updated,
                properties: [
                    'before' => $oldData,
                    'after' => $updated->only([
                        'first_name',
                        'last_name',
                        'email',
                        'phone',
                        'job_id',
                        'status',
                        'is_employee',
                        'source',
                        'experience_years',
                        'current_stage_id',
                    ]),
                ]
            );

            Log::info('Applicant updated successfully', ['id' => $updated->id]);

            return $updated;
        } catch (Exception $e) {
            Log::error("Error updating Applicant ID {$applicant->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function delete(Applicant $applicant): bool
    {
        try {
            $data = $applicant->only([
                'first_name',
                'last_name',
                'email',
                'phone',
                'job_id',
                'status',
                'is_employee',
                'source',
                'experience_years',
                'current_stage_id',
            ]);

            $deleted = $this->repository->delete($applicant);

            $this->activityLogger->log(
                logName: 'applicant',
                description: 'applicant_deleted',
                subject: $applicant,
                properties: $data
            );

            Log::info('Applicant deleted successfully', ['id' => $applicant->id]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting Applicant ID {$applicant->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function getByJobPost(int $jobPostId): Collection
    {
        return $this->repository->getByJobPost($jobPostId);
    }

    /**
     * Run resume analysis with retry logic for synchronous execution
     *
     * @param int $applicantId
     * @return void
     */
    protected function runResumeAnalysisWithRetry(int $applicantId): void
    {
        $maxAttempts = 5;
        // Increased delays: 60s, 2m, 5m, 10m (OpenAI rate limits can be strict)
        $backoffDelays = [60, 120, 300, 600]; // 1m, 2m, 5m, 10m in seconds
        
        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $applicant = Applicant::findOrFail($applicantId);
                
                // Update status to processing on first attempt
                if ($attempt === 1) {
                    $applicant->update(['ai_analysis_status' => 'processing']);
                } else {
                    // Reset to processing for retry
                    $applicant->update(['ai_analysis_status' => 'processing']);
                }
                
                // Call the service directly (not through job) to avoid job retry logic conflicts
                $this->resumeAnalysisService->analyze($applicant);
                
                // Success - exit retry loop
                Log::info('Synchronous resume analysis completed successfully', [
                    'applicant_id' => $applicantId,
                    'attempt' => $attempt,
                ]);
                return;
                
            } catch (\Exception $e) {
                $errorMessage = $e->getMessage();
                $isRateLimitError = $this->isRateLimitError($errorMessage);
                
                Log::warning('Synchronous resume analysis attempt failed', [
                    'applicant_id' => $applicantId,
                    'attempt' => $attempt,
                    'max_attempts' => $maxAttempts,
                    'error' => $errorMessage,
                    'is_rate_limit' => $isRateLimitError,
                ]);
                
                // If it's the last attempt or not a rate limit error, mark as failed
                if ($attempt >= $maxAttempts || !$isRateLimitError) {
                    $applicant = Applicant::find($applicantId);
                    if ($applicant) {
                        $applicant->update(['ai_analysis_status' => 'failed']);
                    }
                    Log::error('Synchronous resume analysis permanently failed', [
                        'applicant_id' => $applicantId,
                        'error' => $errorMessage,
                    ]);
                    // Don't throw - allow applicant creation to succeed even if analysis fails
                    return;
                }
                
                // Determine delay: use retry-after from exception if available, otherwise use backoff
                $delay = $backoffDelays[min($attempt - 1, count($backoffDelays) - 1)];
                
                // Check if exception has retry-after information
                if (property_exists($e, 'retryAfter') && $e->retryAfter) {
                    $delay = max($e->retryAfter, $delay); // Use the larger value
                    Log::info("Using retry-after from OpenAI: {$e->retryAfter} seconds", [
                        'applicant_id' => $applicantId,
                    ]);
                }
                
                Log::info("Waiting {$delay} seconds before retry...", [
                    'applicant_id' => $applicantId,
                    'attempt' => $attempt + 1,
                    'delay' => $delay,
                ]);
                
                sleep($delay);
                
                // Reset status to pending for retry
                $applicant = Applicant::find($applicantId);
                if ($applicant) {
                    $applicant->update(['ai_analysis_status' => 'pending']);
                }
            }
        }
    }

    /**
     * Determine if the error is a rate limit error.
     *
     * @param string $errorMessage
     * @return bool
     */
    protected function isRateLimitError(string $errorMessage): bool
    {
        $rateLimitKeywords = [
            'rate limit',
            'rate_limit',
            'too many requests',
            '429',
            'quota',
            'requests per minute',
        ];

        $errorMessageLower = strtolower($errorMessage);
        
        foreach ($rateLimitKeywords as $keyword) {
            if (str_contains($errorMessageLower, strtolower($keyword))) {
                return true;
            }
        }

        return false;
    }
}
