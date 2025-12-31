<?php

namespace App\Services\OpenAI;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use OpenAI\Client;

class OpenAIService
{
    protected Client $client;
    protected bool $cacheEnabled;

    public function __construct()
    {
        $apiKey = config('openai.api_key');
        
        if (empty($apiKey)) {
            throw new \Exception('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.');
        }

        $this->client = \OpenAI::client($apiKey);
        $this->cacheEnabled = config('openai.cache.enabled', true);
    }

    /**
     * Make a chat completion request to OpenAI
     *
     * @param string $prompt
     * @param array $messages
     * @param array $options
     * @return array
     * @throws \Exception
     */
    public function chatCompletion(string $prompt, array $messages = [], array $options = []): array
    {
        $startTime = microtime(true);
        $model = $options['model'] ?? config('openai.model', 'gpt-4o-mini');
        
        // Generate cache key if caching is enabled
        $cacheKey = null;
        $cacheTtl = null;
        if ($this->cacheEnabled && isset($options['cache_key'])) {
            $cacheKey = $options['cache_key'];
            $cacheTtl = $options['cache_ttl'] ?? config('openai.cache.ttl', 3600);
            
            // Try to get from cache
            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                Log::info('OpenAI response retrieved from cache', ['cache_key' => $cacheKey]);
                return $cached;
            }
        }

        try {
            $systemMessage = [
                'role' => 'system',
                'content' => $prompt,
            ];

            $allMessages = array_merge([$systemMessage], $messages);

            $params = [
                'model' => $model,
                'messages' => $allMessages,
                'max_tokens' => (int) ($options['max_tokens'] ?? config('openai.max_tokens', 2000)),
                'temperature' => (float) ($options['temperature'] ?? config('openai.temperature', 0.7)),
            ];

            if (isset($options['response_format'])) {
                $params['response_format'] = $options['response_format'];
            }

            $response = $this->client->chat()->create($params);

            $content = $response->choices[0]->message->content;
            $tokensUsed = $response->usage->totalTokens;
            $inputTokens = $response->usage->promptTokens ?? null;
            $outputTokens = $response->usage->completionTokens ?? null;
            
            $responseTime = (int) ((microtime(true) - $startTime) * 1000); // Convert to milliseconds

            $result = [
                'content' => $content,
                'tokens_used' => $tokensUsed,
                'input_tokens' => $inputTokens,
                'output_tokens' => $outputTokens,
                'model' => $response->model,
                'response_time_ms' => $responseTime,
            ];

            // Cache the response if caching is enabled
            if ($this->cacheEnabled && $cacheKey !== null) {
                Cache::put($cacheKey, $result, $cacheTtl);
                Log::info('OpenAI response cached', [
                    'cache_key' => $cacheKey,
                    'ttl' => $cacheTtl,
                ]);
            }

            return $result;
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            $isRateLimit = $this->isRateLimitError($errorMessage);
            
            // Try to extract retry-after information from the exception
            $retryAfter = $this->extractRetryAfter($e);
            
            Log::error('OpenAI API Error: ' . $errorMessage, [
                'prompt' => substr($prompt, 0, 100),
                'error' => $errorMessage,
                'is_rate_limit' => $isRateLimit,
                'retry_after' => $retryAfter,
            ]);
            
            // Create exception with retry-after info if available
            $exceptionMessage = 'Failed to get response from OpenAI: ' . $errorMessage;
            if ($retryAfter) {
                $exceptionMessage .= ' (Retry after: ' . $retryAfter . ' seconds)';
            }
            
            $exception = new \Exception($exceptionMessage);
            $exception->retryAfter = $retryAfter;
            
            throw $exception;
        }
    }

    /**
     * Parse JSON response from OpenAI
     *
     * @param string $content
     * @return array
     */
    public function parseJsonResponse(string $content): array
    {
        // Try to extract JSON from markdown code blocks if present
        if (preg_match('/```json\s*(.*?)\s*```/s', $content, $matches)) {
            $content = $matches[1];
        } elseif (preg_match('/```\s*(.*?)\s*```/s', $content, $matches)) {
            $content = $matches[1];
        }

        $decoded = json_decode(trim($content), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('Failed to parse JSON from OpenAI response', [
                'content' => substr($content, 0, 200),
                'error' => json_last_error_msg(),
            ]);
            return [];
        }

        return $decoded ?? [];
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
     * Extract retry-after value from exception if available
     *
     * @param \Exception $exception
     * @return int|null
     */
    protected function extractRetryAfter(\Exception $exception): ?int
    {
        // Check if exception has retry-after in message or properties
        $message = $exception->getMessage();
        
        // Look for "retry after X seconds" or similar patterns
        if (preg_match('/retry[_\s-]?after[:\s]+(\d+)/i', $message, $matches)) {
            return (int) $matches[1];
        }
        
        // Check for property if available
        if (property_exists($exception, 'retryAfter')) {
            return $exception->retryAfter;
        }
        
        // Check response headers if exception has response property
        if (property_exists($exception, 'response') && method_exists($exception->response, 'getHeader')) {
            $retryAfter = $exception->response->getHeader('Retry-After');
            if (!empty($retryAfter)) {
                return (int) $retryAfter[0];
            }
        }
        
        return null;
    }
}

