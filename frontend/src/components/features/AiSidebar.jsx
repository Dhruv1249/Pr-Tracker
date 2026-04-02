import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { useRepo } from "../../context/RepoContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

export default function AiSidebar({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hey! I'm your PR assistant. Ask me anything — merge PRs, check conflicts, list repos, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { activeRepository, user } = useRepo();

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = {};
      if (activeRepository) {
        context.activeRepo = {
          id: activeRepository.id,
          name: activeRepository.name,
          owner: activeRepository.owner,
          fullName: activeRepository.fullName,
        };
      }
      if (user) {
        context.username = user.username;
      }

      const res = await axios.post(
        `${serverEndpoint}/api/ai/agent`,
        { query: text, context },
        { withCredentials: true }
      );

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.data?.message || "No response from AI." },
      ]);
    } catch (err) {
      console.error("AI request failed", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`ai-sidebar ${open ? "ai-sidebar--open" : ""}`}
      >
        {/* ── Header ── */}
        <div className="ai-sidebar__header">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-primary">
              AI Assistant
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-hover transition-colors"
          >
            <X className="h-4 w-4 text-secondary" />
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="ai-sidebar__messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`ai-msg ${
                msg.role === "user" ? "ai-msg--user" : "ai-msg--ai"
              }`}
            >
              {msg.role === "ai" && (
                <div className="ai-msg__avatar">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                </div>
              )}
              <div
                className={`ai-msg__bubble ${
                  msg.role === "user"
                    ? "ai-msg__bubble--user"
                    : "ai-msg__bubble--ai"
                }`}
              >
                {msg.role === "ai" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      code: ({ inline, children, ...props }) =>
                        inline ? (
                          <code
                            className="rounded bg-white/10 px-1 py-0.5 text-xs font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <pre className="my-2 overflow-x-auto rounded-md bg-black/40 p-3 text-xs">
                            <code {...props}>{children}</code>
                          </pre>
                        ),
                      ul: ({ children }) => (
                        <ul className="mb-2 ml-4 list-disc space-y-1 text-xs">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 ml-4 list-decimal space-y-1 text-xs">
                          {children}
                        </ol>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="ai-msg ai-msg--ai">
              <div className="ai-msg__avatar">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div className="ai-msg__bubble ai-msg__bubble--ai">
                <div className="flex items-center gap-1.5 text-secondary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs">Thinking…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="ai-sidebar__input">
          <div className="ai-sidebar__input-row">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your PRs…"
              rows={1}
              className="ai-sidebar__textarea"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="ai-sidebar__send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
