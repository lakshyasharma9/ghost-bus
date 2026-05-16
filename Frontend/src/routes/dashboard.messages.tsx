import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Send, Search, MoreVertical, Loader2 } from "lucide-react";
import { useThreads, useMessages, useSendMessage } from "@/hooks/use-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/messages")({
  head: () => ({ meta: [{ title: "Messages — Dashboard" }] }),
  component: DashboardMessages,
});

function DashboardMessages() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: threadsLoading } = useThreads();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedThread);
  const sendMessage = useSendMessage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredThreads = threads.filter((t: any) =>
    (t.other?.display_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedThreadData = threads.find((t: any) => t.id === selectedThread);

  const handleSend = () => {
    if (!message.trim() || !selectedThread || !selectedRecipient) return;
    sendMessage.mutate({ threadId: selectedThread, recipientId: selectedRecipient, body: message });
    setMessage("");
  };

  const selectThread = (thread: any) => {
    setSelectedThread(thread.id);
    setSelectedRecipient(thread.other?.id ?? null);
  };

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Messages</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Inbox</h1>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[600px]">
        {/* Thread List */}
        <div className="rounded-2xl border border-border overflow-hidden flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threadsLoading ? (
              <div className="py-10 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No conversations yet.</div>
            ) : (
              filteredThreads.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => selectThread(t)}
                  className={`w-full p-4 flex items-start gap-3 border-b border-border hover:bg-muted/50 transition-colors text-left ${selectedThread === t.id ? "bg-accent" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-sm font-semibold shrink-0">
                    {(t.other?.display_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{t.other?.display_name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {t.last_message_at ? new Date(t.last_message_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1">{t.last_message ?? "No messages yet"}</p>
                      {t.myUnread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center">{t.myUnread}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="rounded-2xl border border-border overflow-hidden flex flex-col bg-card">
          {!selectedThread ? (
            <div className="flex-1 grid place-items-center text-muted-foreground">
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-sm font-semibold">
                    {(selectedThreadData?.other?.display_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{selectedThreadData?.other?.display_name ?? "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">Producer</div>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-lg grid place-items-center hover:bg-muted transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="py-10 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                ) : messages.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello!</div>
                ) : (
                  messages.map((m: any) => {
                    const isMe = m.sender_id === currentUserId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                            {m.body}
                          </div>
                          <span className="text-xs text-muted-foreground px-1">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessage.isPending}
                    className="w-10 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 transition shadow-[0_4px_14px_rgba(10,132,255,0.28)]"
                  >
                    {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
