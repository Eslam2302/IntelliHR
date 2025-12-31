<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'message' => $this->message,
            'response' => $this->response,
            'tokens_used' => $this->tokens_used,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

