<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatConversationResource;
use App\Models\ChatConversation;
use App\Services\OpenAI\HRChatAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;

class AIChatController extends Controller implements HasMiddleware
{
    public function __construct(
        protected HRChatAssistantService $chatService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    /**
     * Send a message to the chat assistant
     */
    public function ask(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|string',
        ]);

        try {
            $user = Auth::user();
            $result = $this->chatService->ask(
                $request->input('message'),
                $user,
                $request->input('session_id')
            );

            return response()->json([
                'status' => 'success',
                'data' => [
                    'session_id' => $result['session_id'],
                    'response' => $result['response'],
                    'tokens_used' => $result['tokens_used'],
                    'conversation_id' => $result['conversation_id'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process chat message: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get conversation history
     */
    public function history(Request $request): JsonResponse
    {
        $user = Auth::user();
        $employeeId = $user->employee?->id;

        $query = ChatConversation::query();

        if ($user->id) {
            $query->where(function ($q) use ($user, $employeeId) {
                $q->where('user_id', $user->id);
                if ($employeeId) {
                    $q->orWhere('employee_id', $employeeId);
                }
            });
        } elseif ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $conversations = $query->recent(50)->get();

        return response()->json([
            'status' => 'success',
            'data' => ChatConversationResource::collection($conversations),
        ]);
    }

    /**
     * Get conversation history for a specific session
     */
    public function getSession(string $sessionId): JsonResponse
    {
        $user = Auth::user();
        $employeeId = $user->employee?->id;

        $conversations = ChatConversation::forSession($sessionId)
            ->where(function ($query) use ($user, $employeeId) {
                if ($user->id) {
                    $query->where('user_id', $user->id);
                }
                if ($employeeId) {
                    $query->orWhere('employee_id', $employeeId);
                }
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => ChatConversationResource::collection($conversations),
        ]);
    }

    /**
     * Delete all conversations in a session (delete entire chat).
     */
    public function deleteSession(string $sessionId): JsonResponse
    {
        $user = Auth::user();
        $employeeId = $user->employee?->id;

        $query = ChatConversation::forSession($sessionId);
        if ($user->id) {
            $query->where(function ($q) use ($user, $employeeId) {
                $q->where('user_id', $user->id);
                if ($employeeId) {
                    $q->orWhere('employee_id', $employeeId);
                }
            });
        } elseif ($employeeId) {
            $query->where('employee_id', $employeeId);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this session.',
            ], 403);
        }

        $deleted = $query->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Chat deleted successfully.',
            'deleted_count' => $deleted,
        ]);
    }

    /**
     * Delete a conversation
     */
    public function deleteConversation(ChatConversation $conversation): JsonResponse
    {
        $user = Auth::user();

        // Verify ownership
        if ($conversation->user_id !== $user->id && $conversation->employee_id !== $user->employee?->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this conversation.',
            ], 403);
        }

        $conversation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation deleted successfully.',
        ]);
    }
}

