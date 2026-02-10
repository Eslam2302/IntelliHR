"use client";

import { useState, useEffect, useRef } from "react";
import { ask, getHistory, getSession, deleteSession, deleteConversation } from "@/services/api/chat";
import type { ChatConversation } from "@/lib/types/chat";

function groupBySession(conversations: ChatConversation[]): Map<string, ChatConversation[]> {
  const map = new Map<string, ChatConversation[]>();
  for (const c of conversations) {
    const sid = c.session_id || "unknown";
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid)!.push(c);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  return map;
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatConversation[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatConversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const skipLoadSessionRef = useRef(false);

  const sessions = groupBySession(history);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const list = await getHistory();
      setHistory(list);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadSession = async (sid: string) => {
    setError(null);
    try {
      const list = await getSession(sid);
      setMessages(list);
      setSessionId(sid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load session");
      setMessages([]);
    }
  };

  useEffect(() => {
    if (skipLoadSessionRef.current) {
      skipLoadSessionRef.current = false;
      return;
    }
    if (sessionId) {
      loadSession(sessionId);
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setError(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);
    try {
      const result = await ask(text, sessionId ?? undefined);
      skipLoadSessionRef.current = true;
      setSessionId(result.session_id);
      setMessages((prev) => [
        ...prev,
        {
          id: result.conversation_id,
          session_id: result.session_id,
          message: text,
          response: result.response,
          tokens_used: result.tokens_used,
          created_at: new Date().toISOString(),
        },
      ]);
      await loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSession = async (sid: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this chat? All messages in this conversation will be permanently removed. This action cannot be undone."
      )
    ) {
      return;
    }
    setDeletingSessionId(sid);
    setError(null);
    try {
      await deleteSession(sid);
      if (sessionId === sid) {
        setSessionId(null);
        setMessages([]);
      }
      await loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete chat");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleDeleteConversation = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteConversation(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      await loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100">
          <button
            type="button"
            onClick={startNewChat}
            className="w-full py-2 px-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {historyLoading ? (
            <p className="text-xs text-gray-500 p-2">Loading…</p>
          ) : (
            Array.from(sessions.entries()).map(([sid, convos]) => {
              const last = convos[convos.length - 1];
              const preview = last?.message?.slice(0, 40) || "Chat";
              const isDeleting = deletingSessionId === sid;
              return (
                <div
                  key={sid}
                  className={`group flex items-center gap-1 rounded-lg mb-1 ${sessionId === sid ? "bg-indigo-100" : "hover:bg-gray-100"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setSessionId(sid)}
                    className={`flex-1 min-w-0 text-left py-2 px-3 rounded-lg text-sm ${sessionId === sid ? "text-indigo-900" : "text-gray-700"
                      }`}
                  >
                    <span className="truncate block">{preview}{preview.length >= 40 ? "…" : ""}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(sid);
                    }}
                    disabled={isDeleting}
                    title="Delete entire chat"
                    className="shrink-0 p-1.5 rounded text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
          )}
          {messages.length === 0 && !sessionId && (
            <p className="text-gray-500 text-sm">Start a new conversation by typing below.</p>
          )}
          {messages.length === 0 && sessionId && !error && (
            <p className="text-gray-500 text-sm">No messages in this session.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="group relative rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="flex absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => handleDeleteConversation(m.id)}
                  disabled={deletingId === m.id}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Delete this message"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deletingId === m.id ? "Deleting…" : "Delete"}
                </button>
              </div>
              <div className="space-y-2 pr-24">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm">
                    {m.message}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-2 text-sm text-gray-900 whitespace-pre-wrap">
                  {m.response}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-lg border text-black border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
