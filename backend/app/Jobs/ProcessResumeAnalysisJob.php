<?php

namespace App\Jobs;

use App\Models\Applicant;
use App\Services\OpenAI\ResumeAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessResumeAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 5;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $applicantId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(ResumeAnalysisService $resumeAnalysisService): void
    {
        try {
            $applicant = Applicant::findOrFail($this->applicantId);

            // Update status to processing
            $applicant->update(['ai_analysis_status' => 'processing']);

            // Perform analysis
            $resumeAnalysisService->analyze($applicant);

            Log::info('Resume analysis job completed', [
                'applicant_id' => $this->applicantId,
            ]);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            $isRateLimitError = $this->isRateLimitError($errorMessage);
            
            Log::warning('Resume analysis job attempt failed', [
                'applicant_id' => $this->applicantId,
                'attempt' => $this->attempts(),
                'max_attempts' => $this->tries,
                'error' => $errorMessage,
                'is_rate_limit' => $isRateLimitError,
            ]);

            // If it's a rate limit error and we have retries left, release the job back to queue
            if ($isRateLimitError && $this->attempts() < $this->tries) {
                $applicant = Applicant::find($this->applicantId);
                if ($applicant) {
                    $applicant->update(['ai_analysis_status' => 'pending']);
                }
                
                // Throw to trigger retry with backoff
                throw $e;
            }

            // Permanent failure - update status to failed
            $applicant = Applicant::find($this->applicantId);
            if ($applicant) {
                $applicant->update(['ai_analysis_status' => 'failed']);
            }

            // Only throw if it's not the last attempt
            if ($this->attempts() < $this->tries) {
                throw $e;
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

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        $applicant = Applicant::find($this->applicantId);
        if ($applicant) {
            $applicant->update(['ai_analysis_status' => 'failed']);
        }

        Log::error('Resume analysis job permanently failed', [
            'applicant_id' => $this->applicantId,
            'error' => $exception->getMessage(),
        ]);
    }
}
