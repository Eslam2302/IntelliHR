export interface ChatConversation {
  id: number;
  session_id: string;
  message: string;
  response: string;
  tokens_used?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface ChatAskResponse {
  session_id: string;
  response: string;
  tokens_used?: number;
  conversation_id: number;
}

export interface ChatHistoryResponse {
  data: ChatConversation[];
}
