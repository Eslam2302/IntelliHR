import { API_URL } from "@/config/api";
import { fetchWithAuth } from "@/lib/utils/api";
import type { ChatConversation, ChatAskResponse } from "@/lib/types/chat";

export async function ask(
  message: string,
  sessionId?: string | null
): Promise<ChatAskResponse> {
  const body: { message: string; session_id?: string } = { message };
  if (sessionId) body.session_id = sessionId;
  const res = await fetchWithAuth(`${API_URL}/chat/ask`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const raw = res.data ?? res;
  return {
    session_id: raw.session_id,
    response: raw.response,
    tokens_used: raw.tokens_used,
    conversation_id: raw.conversation_id,
  };
}

export async function getHistory(): Promise<ChatConversation[]> {
  const res = await fetchWithAuth(`${API_URL}/chat/history`);
  const data = res.data ?? res;
  return Array.isArray(data) ? data : [];
}

export async function getSession(sessionId: string): Promise<ChatConversation[]> {
  const res = await fetchWithAuth(
    `${API_URL}/chat/session/${encodeURIComponent(sessionId)}`
  );
  const data = res.data ?? res;
  return Array.isArray(data) ? data : [];
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetchWithAuth(
    `${API_URL}/chat/session/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );
}

export async function deleteConversation(conversationId: number): Promise<void> {
  await fetchWithAuth(`${API_URL}/chat/history/${conversationId}`, {
    method: "DELETE",
  });
}
