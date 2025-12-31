<?php

namespace App\Services\OpenAI;

use App\Models\Applicant;
use App\Models\JobPost;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ResumeAnalysisService
{
    public function __construct(
        protected OpenAIService $openAIService,
        protected ResumeTextExtractorService $textExtractor,
        protected AIAnalyticsService $analyticsService
    ) {}

    /**
     * Analyze resume against job requirements
     *
     * @param Applicant $applicant
     * @param JobPost|null $jobPost
     * @return array
     * @throws \Exception
     */
    public function analyze(Applicant $applicant, ?JobPost $jobPost = null): array
    {
        if (empty($applicant->resume_path)) {
            throw new \Exception('Resume file not found for applicant.');
        }

        // Get job post if not provided
        if (!$jobPost) {
            $jobPost = $applicant->job;
        }

        if (!$jobPost) {
            throw new \Exception('Job post not found for applicant.');
        }

        $startTime = microtime(true);

        try {
            // Check cache first (cache key based on applicant ID and job post ID)
            $cacheEnabled = config('openai.cache.enabled', true);
            $cacheKey = null;
            $cacheTtl = config('openai.cache.resume_analysis_ttl', 86400); // 24 hours

            if ($cacheEnabled && $applicant->ai_analysis_status === 'completed' && $applicant->ai_analyzed_at) {
                $cacheKey = "resume_analysis:{$applicant->id}:{$jobPost->id}";
                $cached = Cache::get($cacheKey);
                
                if ($cached !== null) {
                    Log::info('Resume analysis retrieved from cache', [
                        'applicant_id' => $applicant->id,
                        'cache_key' => $cacheKey,
                    ]);
                    return $cached;
                }
            }

            // Extract text from PDF
            $resumeText = $this->textExtractor->extractFromPdf($applicant->resume_path);

            // Build prompt
            $prompt = $this->buildAnalysisPrompt($jobPost, $resumeText);

            // Generate cache key for OpenAI response
            $openAICacheKey = null;
            if ($cacheEnabled) {
                $openAICacheKey = 'openai_resume:' . md5($prompt . $jobPost->id);
            }

            // Call OpenAI API with caching
            $response = $this->openAIService->chatCompletion($prompt, [], [
                'response_format' => ['type' => 'json_object'],
                'cache_key' => $openAICacheKey,
                'cache_ttl' => $cacheTtl,
            ]);

            // Parse response
            $analysis = $this->openAIService->parseJsonResponse($response['content']);

            if (empty($analysis)) {
                throw new \Exception('Failed to parse analysis response from OpenAI.');
            }

            // Structure the response
            $result = [
                'ai_score' => $analysis['match_score'] ?? 0,
                'ai_analysis' => $analysis,
                'ai_matched_skills' => $analysis['matched_skills'] ?? [],
                'ai_missing_skills' => $analysis['missing_skills'] ?? [],
                'ai_recommendation' => $this->determineRecommendation($analysis['match_score'] ?? 0),
                'ai_analyzed_at' => now(),
                'ai_analysis_status' => 'completed',
            ];

            // Update applicant
            $applicant->update($result);

            // Cache the result
            if ($cacheEnabled && $cacheKey) {
                Cache::put($cacheKey, $result, $cacheTtl);
            }

            $responseTime = (int) ((microtime(true) - $startTime) * 1000);

            // Track analytics
            $this->analyticsService->track([
                'feature_type' => 'resume_analysis',
                'applicant_id' => $applicant->id,
                'model' => $response['model'] ?? config('openai.model', 'gpt-4o-mini'),
                'tokens_used' => $response['tokens_used'] ?? 0,
                'input_tokens' => $response['input_tokens'] ?? null,
                'output_tokens' => $response['output_tokens'] ?? null,
                'prompt' => $prompt,
                'response' => $response['content'] ?? '',
                'response_time_ms' => $responseTime,
                'status' => 'success',
            ]);

            Log::info('Resume analysis completed', [
                'applicant_id' => $applicant->id,
                'score' => $result['ai_score'],
                'tokens_used' => $response['tokens_used'],
                'response_time_ms' => $responseTime,
            ]);

            return $result;
        } catch (\Exception $e) {
            $responseTime = (int) ((microtime(true) - $startTime) * 1000);

            // Update status to failed
            $applicant->update([
                'ai_analysis_status' => 'failed',
            ]);

            // Track failed analytics
            $this->analyticsService->track([
                'feature_type' => 'resume_analysis',
                'applicant_id' => $applicant->id,
                'model' => config('openai.model', 'gpt-4o-mini'),
                'tokens_used' => 0,
                'response_time_ms' => $responseTime,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Resume analysis failed', [
                'applicant_id' => $applicant->id,
                'error' => $e->getMessage(),
                'response_time_ms' => $responseTime,
            ]);

            throw $e;
        }
    }

    /**
     * Build analysis prompt for OpenAI
     *
     * @param JobPost $jobPost
     * @param string $resumeText
     * @return string
     */
    protected function buildAnalysisPrompt(JobPost $jobPost, string $resumeText): string
    {
        return "You are an expert HR recruiter analyzing resumes. Analyze this resume against the job requirements and return a JSON response.

Job Title: {$jobPost->title}
Job Description: {$jobPost->description}
Requirements: {$jobPost->requirements}
Responsibilities: {$jobPost->responsibilities}

Resume Text:
{$resumeText}

Return a JSON object with the following structure:
{
    \"match_score\": <number 0-100>,
    \"matched_skills\": [<array of skills that match>],
    \"missing_skills\": [<array of required skills that are missing>],
    \"experience_summary\": \"<summary of candidate's experience>\",
    \"education_summary\": \"<summary of candidate's education>\",
    \"strengths\": [<array of candidate's strengths>],
    \"gaps\": [<array of gaps or weaknesses>],
    \"overall_assessment\": \"<brief overall assessment>\"
}

Be thorough and objective in your analysis.";
    }

    /**
     * Determine recommendation based on score
     *
     * @param float $score
     * @return string
     */
    protected function determineRecommendation(float $score): string
    {
        if ($score >= 80) {
            return 'strong_match';
        } elseif ($score >= 60) {
            return 'good_match';
        } elseif ($score >= 40) {
            return 'weak_match';
        } else {
            return 'not_suitable';
        }
    }
}

