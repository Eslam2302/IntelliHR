<?php

namespace App\Services\OpenAI;

use App\Models\ChatConversation;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class HRChatAssistantService
{
    public function __construct(
        protected OpenAIService $openAIService,
        protected EmployeeContextService $contextService,
        protected AIAnalyticsService $analyticsService
    ) {}

    /**
     * Process chat message and generate response
     *
     * @param string $message
     * @param User|null $user
     * @param string|null $sessionId
     * @return array
     * @throws \Exception
     */
    public function ask(string $message, ?User $user = null, ?string $sessionId = null): array
    {
        $startTime = microtime(true);
        
        try {
            // Generate or use provided session ID
            if (!$sessionId) {
                $sessionId = Str::uuid()->toString();
            }

            // Get employee if user is authenticated
            $employee = null;
            $context = null;
            $requestedEmployeeContext = null;
            $requestedEmployeeId = null;

            if ($user && $user->employee) {
                $employee = $user->employee;
                $context = $this->contextService->getContext($employee);

                // If the user has permission to view other employees' data, allow querying by employee id
                if ($this->userCanQueryOtherEmployees($user)) {
                    $requestedId = $this->parseRequestedEmployeeId($message);
                    if ($requestedId !== null && $requestedId !== $employee->id) {
                        $requestedEmployee = Employee::find($requestedId);
                        if ($requestedEmployee) {
                            $requestedEmployeeContext = $this->contextService->getContext($requestedEmployee);
                            $requestedEmployeeId = $requestedId;
                        }
                    }
                }
            }

            // Get conversation history
            $history = $this->getConversationHistory($sessionId, $user?->id, $employee?->id);

            // Build prompt (include requested employee context when admin asks about another employee)
            $prompt = $this->buildPrompt($context, $requestedEmployeeContext, $requestedEmployeeId);

            // Build messages from history
            $messages = $this->buildMessagesFromHistory($history, $message);

            // Check cache for similar queries (only for simple queries without history)
            $cacheEnabled = config('openai.cache.enabled', true);
            $cacheKey = null;
            $cacheTtl = config('openai.cache.chat_response_ttl', 1800); // 30 minutes
            
            // Only cache if no conversation history (first message in session)
            if ($cacheEnabled && $history->isEmpty()) {
                $cacheKey = 'chat_response:' . md5($prompt . $message . ($employee?->id ?? 'anonymous'));
                $cached = Cache::get($cacheKey);
                
                if ($cached !== null) {
                    Log::info('Chat response retrieved from cache', [
                        'cache_key' => $cacheKey,
                        'user_id' => $user?->id,
                    ]);
                    
                    // Still save conversation for history
                    $conversation = ChatConversation::create([
                        'user_id' => $user?->id,
                        'employee_id' => $employee?->id,
                        'session_id' => $sessionId,
                        'message' => $message,
                        'response' => $cached['content'],
                        'context_data' => $context,
                        'tokens_used' => $cached['tokens_used'] ?? 0,
                    ]);
                    
                    return [
                        'session_id' => $sessionId,
                        'response' => $cached['content'],
                        'tokens_used' => $cached['tokens_used'] ?? 0,
                        'conversation_id' => $conversation->id,
                        'cached' => true,
                    ];
                }
            }

            // Generate cache key for OpenAI response (if no history)
            $openAICacheKey = null;
            if ($cacheEnabled && $history->isEmpty()) {
                $openAICacheKey = 'openai_chat:' . md5($prompt . $message);
            }

            // Call OpenAI with caching option
            $response = $this->openAIService->chatCompletion($prompt, $messages, [
                'cache_key' => $openAICacheKey,
                'cache_ttl' => $cacheTtl,
            ]);

            $responseTime = (int) ((microtime(true) - $startTime) * 1000);

            // Save conversation
            $conversation = ChatConversation::create([
                'user_id' => $user?->id,
                'employee_id' => $employee?->id,
                'session_id' => $sessionId,
                'message' => $message,
                'response' => $response['content'],
                'context_data' => $context,
                'tokens_used' => $response['tokens_used'],
            ]);

            // Cache the response if applicable
            if ($cacheEnabled && $cacheKey && $history->isEmpty()) {
                Cache::put($cacheKey, $response, $cacheTtl);
            }

            // Track analytics
            $this->analyticsService->track([
                'feature_type' => 'chat_assistant',
                'user_id' => $user?->id,
                'employee_id' => $employee?->id,
                'conversation_id' => $conversation->id,
                'model' => $response['model'] ?? config('openai.model', 'gpt-4o-mini'),
                'tokens_used' => $response['tokens_used'] ?? 0,
                'input_tokens' => $response['input_tokens'] ?? null,
                'output_tokens' => $response['output_tokens'] ?? null,
                'prompt' => $prompt,
                'response' => $response['content'] ?? '',
                'response_time_ms' => $responseTime,
                'status' => 'success',
            ]);

            return [
                'session_id' => $sessionId,
                'response' => $response['content'],
                'tokens_used' => $response['tokens_used'],
                'conversation_id' => $conversation->id,
            ];
        } catch (\Exception $e) {
            $responseTime = (int) ((microtime(true) - $startTime) * 1000);
            
            // Track failed analytics
            $this->analyticsService->track([
                'feature_type' => 'chat_assistant',
                'user_id' => $user?->id,
                'employee_id' => $user?->employee?->id,
                'model' => config('openai.model', 'gpt-4o-mini'),
                'tokens_used' => 0,
                'response_time_ms' => $responseTime,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Chat assistant error: ' . $e->getMessage(), [
                'message' => substr($message, 0, 100),
                'user_id' => $user?->id,
                'response_time_ms' => $responseTime,
            ]);
            throw new \Exception('Failed to process chat message: ' . $e->getMessage());
        }
    }

    /**
     * Permissions that allow the user to query other employees' data in chat (e.g. leave balance, attendance).
     * If the logged-in user's employee has any of these, they can ask about another employee by id.
     *
     * @var array<string>
     */
    protected static array $permissionsToQueryOtherEmployees = [
        'view-all-employees',
        'view-employee',
        'view-employees-leave-request',
        'view-all-payrolls',
        'view-all-attendances',
    ];

    /**
     * Check whether the logged-in user has permission to view other employees' data (so we can inject it in chat).
     */
    protected function userCanQueryOtherEmployees(?User $user): bool
    {
        if (! $user || ! $user->employee) {
            return false;
        }

        $employee = $user->employee;

        foreach (static::$permissionsToQueryOtherEmployees as $permission) {
            if ($employee->can($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Parse employee ID from message (e.g. "employee 3", "balance of employee 3", "employee id 3")
     *
     * @param string $message
     * @return int|null
     */
    protected function parseRequestedEmployeeId(string $message): ?int
    {
        // Match "employee 3", "employee id 3", "employee #3", "employee 3's", "employee 3 balance"
        if (preg_match('/employee\s*(?:id\s*)?#?\s*(\d+)/i', $message, $m)) {
            $id = (int) $m[1];
            return $id > 0 ? $id : null;
        }
        // Match "balance of 3", "leave balance for 3" (only if preceded by context suggesting employee)
        if (preg_match('/(?:balance|leave|data|info)\s+(?:of|for)\s+(\d+)\b/i', $message, $m)) {
            $id = (int) $m[1];
            return $id > 0 ? $id : null;
        }
        return null;
    }

    /**
     * Build system prompt for chat assistant
     *
     * @param array|null $context
     * @param array|null $requestedEmployeeContext
     * @param int|null $requestedEmployeeId
     * @return string
     */
    protected function buildPrompt(?array $context = null, ?array $requestedEmployeeContext = null, ?int $requestedEmployeeId = null): string
    {
        $prompt = "You are an HR assistant for IntelliHR, a comprehensive Human Resources Management System. ";

        // User with permission asking about another employee: inject that employee's data and instruct to use it
        if ($requestedEmployeeContext !== null && $requestedEmployeeId !== null) {
            $prompt .= "\n\nThe user has permission to view other employees' data. They are asking about another employee (Employee ID: {$requestedEmployeeId}). Use the following data to answer their question.";
            $prompt .= "\n\n" . $this->contextService->formatContextForPrompt($requestedEmployeeContext);
            $prompt .= "\n\nAnswer the user's question using the above employee data. You may and should provide leave balance, attendance, salary (basic salary, net pay), payroll details, and other HR information when it appears in the context above. The user is authorized to see this information—do not refuse or redirect them to HR.";
        } elseif ($context) {
            $prompt .= "\n\n" . $this->contextService->formatContextForPrompt($context);
            $prompt .= "\n\nYou have access to this employee's personal data. Use it to answer questions about their leave balance, attendance, salary/payroll, and other HR-related queries. When salary or payroll figures appear above, provide them in your answer—the user is authorized to see this information.";
        } else {
            $prompt .= "\n\nYou can answer general HR questions about:\n";
            $prompt .= "- Leave types and policies\n";
            $prompt .= "- Benefits information\n";
            $prompt .= "- Company policies\n";
            $prompt .= "- HR processes and procedures\n";
            $prompt .= "\nNote: You do not have access to personal employee data. For personal information, users need to be authenticated.";
        }

        $prompt .= "\n\nProvide helpful, accurate, and concise responses. Be professional and friendly.";

        return $prompt;
    }

    /**
     * Get conversation history for context
     *
     * @param string $sessionId
     * @param int|null $userId
     * @param int|null $employeeId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getConversationHistory(string $sessionId, ?int $userId, ?int $employeeId): \Illuminate\Database\Eloquent\Collection
    {
        $query = ChatConversation::forSession($sessionId)
            ->recent(config('openai.chat_assistant.max_history', 10));

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        return $query->get();
    }

    /**
     * Build messages array from history for OpenAI
     *
     * @param \Illuminate\Database\Eloquent\Collection $history
     * @param string $currentMessage
     * @return array
     */
    protected function buildMessagesFromHistory(\Illuminate\Database\Eloquent\Collection $history, string $currentMessage): array
    {
        $messages = [];

        // Add history (excluding current message)
        foreach ($history->reverse() as $conv) {
            $messages[] = [
                'role' => 'user',
                'content' => $conv->message,
            ];
            $messages[] = [
                'role' => 'assistant',
                'content' => $conv->response,
            ];
        }

        // Add current message
        $messages[] = [
            'role' => 'user',
            'content' => $currentMessage,
        ];

        return $messages;
    }
}

