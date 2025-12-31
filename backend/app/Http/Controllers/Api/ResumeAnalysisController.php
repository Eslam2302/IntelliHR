<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Services\OpenAI\ResumeAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ResumeAnalysisController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ResumeAnalysisService $resumeAnalysisService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-applicant', only: ['getAnalysis']),
            new Middleware('permission:edit-applicant', only: ['analyze', 'reAnalyze']),
        ];
    }

    /**
     * Manually trigger resume analysis
     */
    public function analyze(Applicant $applicant): JsonResponse
    {
        try {
            if (empty($applicant->resume_path)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Resume file not found for this applicant.',
                ], 404);
            }

            $this->resumeAnalysisService->analyze($applicant);

            return response()->json([
                'status' => 'success',
                'message' => 'Resume analysis completed successfully.',
                'data' => [
                    'ai_score' => $applicant->fresh()->ai_score,
                    'ai_recommendation' => $applicant->fresh()->ai_recommendation,
                    'ai_analysis_status' => $applicant->fresh()->ai_analysis_status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to analyze resume: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get analysis results
     */
    public function getAnalysis(Applicant $applicant): JsonResponse
    {
        if ($applicant->ai_analysis_status === 'pending' || $applicant->ai_analysis_status === 'processing') {
            return response()->json([
                'status' => 'processing',
                'message' => 'Analysis is still in progress.',
                'data' => [
                    'status' => $applicant->ai_analysis_status,
                ],
            ], 202);
        }

        if ($applicant->ai_analysis_status === 'failed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Analysis failed. Please try again.',
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'ai_score' => $applicant->ai_score,
                'ai_recommendation' => $applicant->ai_recommendation,
                'ai_matched_skills' => $applicant->ai_matched_skills,
                'ai_missing_skills' => $applicant->ai_missing_skills,
                'ai_analysis' => $applicant->ai_analysis,
                'ai_analyzed_at' => $applicant->ai_analyzed_at,
            ],
        ]);
    }

    /**
     * Re-analyze resume (useful when job requirements change)
     */
    public function reAnalyze(Applicant $applicant): JsonResponse
    {
        try {
            if (empty($applicant->resume_path)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Resume file not found for this applicant.',
                ], 404);
            }

            $this->resumeAnalysisService->analyze($applicant);

            return response()->json([
                'status' => 'success',
                'message' => 'Resume re-analysis completed successfully.',
                'data' => [
                    'ai_score' => $applicant->fresh()->ai_score,
                    'ai_recommendation' => $applicant->fresh()->ai_recommendation,
                    'ai_analysis_status' => $applicant->fresh()->ai_analysis_status,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to re-analyze resume: ' . $e->getMessage(),
            ], 500);
        }
    }
}

