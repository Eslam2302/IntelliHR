<?php

namespace App\Services\OpenAI;

use App\Models\AIUsageAnalytic;
use Illuminate\Support\Facades\Log;

class AIAnalyticsService
{
    /**
     * Track AI usage analytics
     *
     * @param array $data
     * @return AIUsageAnalytic
     */
    public function track(array $data): AIUsageAnalytic
    {
        if (!config('openai.analytics.enabled', true)) {
            return new AIUsageAnalytic(); // Return empty model if disabled
        }

        try {
            // Calculate estimated cost if enabled
            $estimatedCost = 0;
            if (config('openai.analytics.track_costs', true) && isset($data['tokens_used']) && isset($data['model'])) {
                $estimatedCost = $this->calculateCost(
                    $data['tokens_used'],
                    $data['model'],
                    $data['input_tokens'] ?? null,
                    $data['output_tokens'] ?? null
                );
            }

            $analytic = AIUsageAnalytic::create([
                'feature_type' => $data['feature_type'] ?? 'unknown',
                'user_id' => $data['user_id'] ?? null,
                'employee_id' => $data['employee_id'] ?? null,
                'applicant_id' => $data['applicant_id'] ?? null,
                'conversation_id' => $data['conversation_id'] ?? null,
                'model' => $data['model'] ?? config('openai.model', 'gpt-4o-mini'),
                'tokens_used' => $data['tokens_used'] ?? 0,
                'estimated_cost' => $estimatedCost,
                'prompt_preview' => isset($data['prompt']) ? substr($data['prompt'], 0, 200) : null,
                'prompt_length' => isset($data['prompt']) ? strlen($data['prompt']) : 0,
                'response_length' => isset($data['response']) ? strlen($data['response']) : 0,
                'response_time_ms' => $data['response_time_ms'] ?? null,
                'status' => $data['status'] ?? 'success',
                'error_message' => $data['error_message'] ?? null,
            ]);

            return $analytic;
        } catch (\Exception $e) {
            // Don't fail the main operation if analytics fails
            Log::warning('Failed to track AI analytics: ' . $e->getMessage(), [
                'data' => $data,
            ]);
            return new AIUsageAnalytic();
        }
    }

    /**
     * Calculate estimated cost based on tokens and model
     *
     * @param int $totalTokens
     * @param string $model
     * @param int|null $inputTokens
     * @param int|null $outputTokens
     * @return float
     */
    protected function calculateCost(int $totalTokens, string $model, ?int $inputTokens = null, ?int $outputTokens = null): float
    {
        $pricing = config("openai.pricing.{$model}", config('openai.pricing.gpt-4o-mini', [
            'input' => 0.15,
            'output' => 0.60,
        ]));

        // If we have separate input/output tokens, use them
        if ($inputTokens !== null && $outputTokens !== null) {
            $inputCost = ($inputTokens / 1_000_000) * $pricing['input'];
            $outputCost = ($outputTokens / 1_000_000) * $pricing['output'];
            return $inputCost + $outputCost;
        }

        // Otherwise, estimate 70% input, 30% output (typical ratio)
        $estimatedInput = (int) ($totalTokens * 0.7);
        $estimatedOutput = (int) ($totalTokens * 0.3);

        $inputCost = ($estimatedInput / 1_000_000) * $pricing['input'];
        $outputCost = ($estimatedOutput / 1_000_000) * $pricing['output'];

        return $inputCost + $outputCost;
    }

    /**
     * Get analytics summary
     *
     * @param array $filters
     * @return array
     */
    public function getSummary(array $filters = []): array
    {
        $query = AIUsageAnalytic::query();

        if (isset($filters['feature_type'])) {
            $query->where('feature_type', $filters['feature_type']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
        }

        $total = $query->count();
        $successful = (clone $query)->where('status', 'success')->count();
        $failed = (clone $query)->where('status', 'failed')->count();
        $totalTokens = (clone $query)->sum('tokens_used');
        $totalCost = (clone $query)->sum('estimated_cost');
        $avgResponseTime = (clone $query)->whereNotNull('response_time_ms')->avg('response_time_ms');

        return [
            'total_requests' => $total,
            'successful' => $successful,
            'failed' => $failed,
            'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 0,
            'total_tokens' => $totalTokens,
            'total_cost_usd' => round($totalCost, 6),
            'average_response_time_ms' => round($avgResponseTime ?? 0, 2),
        ];
    }
}

