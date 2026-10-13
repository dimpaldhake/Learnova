import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/AIChatbot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const API_BASE = "http://127.0.0.1:8000/api";

function getAccessToken() {
    return localStorage.getItem("access") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token");
}

async function historyRequest(path, options = {}) {
    const token = getAccessToken();
    if (!token) throw new Error("Please log in again. Your access token was not found.");
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });
    if (response.status === 204) return null;
    let data = {};
    try { data = await response.json(); } catch { /* empty response */ }
    if (!response.ok) {
        if (response.status === 401) throw new Error("Your session expired. Please log in again.");
        throw new Error(data.detail || data.error || data.message || `Request failed (${response.status}).`);
    }
    return data;
}

function normalizeConversation(item) {
    return {
        id: item.id,
        title: item.title || "New conversation",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        messages: (item.messages || []).map((message) => ({
            id: message.id,
            sender: message.role,
            text: message.content,
            time: message.created_at,
        })),
    };
}

function CodeBlock({ language, code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = code;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                textarea.remove();
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error("Unable to copy code:", error);
        }
    };

    return (
        <div className="ai-code-block">
            <div className="ai-code-toolbar">
                <span>{language || "code"}</span>
                <button type="button" onClick={handleCopy} className="ai-copy-code-button">
                    {copied ? "✓ Copied!" : "Copy code"}
                </button>
            </div>
            <SyntaxHighlighter
                language={language || "text"}
                style={oneDark}
                PreTag="div"
                customStyle={{ margin: 0, padding: "14px", borderRadius: "0 0 10px 10px", fontSize: "13px", overflowX: "auto" }}
                codeTagProps={{ style: { fontFamily: 'Consolas, "Courier New", monospace' } }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

const markdownComponents = {
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children, ...props }) => {
        const match = /language-([\w-]+)/.exec(className || "");
        const code = String(children).replace(/\n$/, "");
        if (match) return <CodeBlock language={match[1]} code={code} />;
        return <code className={className} {...props}>{children}</code>;
    },
};

function AIChatbot() {
    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notice, setNotice] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const activeConversation = conversations.find((chat) => chat.id === activeId) || conversations[0];
    const messages = activeConversation?.messages || [];

    useEffect(() => {
        let cancelled = false;
        const loadServerHistory = async () => {
            try {
                const data = await historyRequest("/conversations/");
                let loaded = (Array.isArray(data) ? data : data.results || []).map(normalizeConversation);
                if (!loaded.length) {
                    const created = await historyRequest("/conversations/", {
                        method: "POST",
                        body: JSON.stringify({ title: "New conversation" }),
                    });
                    loaded = [normalizeConversation(created)];
                }
                if (!cancelled) {
                    setConversations(loaded);
                    setActiveId(loaded[0]?.id ?? null);
                }
            } catch (error) {
                console.error("Unable to load PostgreSQL chat history:", error);
                if (!cancelled) setNotice(`Could not load saved chats: ${error.message}`);
            } finally {
                if (!cancelled) setHistoryLoading(false);
            }
        };
        loadServerHistory();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 3500);
        return () => window.clearTimeout(timer);
    }, [notice]);

    const filteredConversations = useMemo(() => {
        const term = search.trim().toLowerCase();
        return [...conversations]
            .filter((chat) => !term || chat.title.toLowerCase().includes(term) ||
                chat.messages.some((message) => String(message.text).toLowerCase().includes(term)))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [conversations, search]);

    const updateActiveConversation = (updater) => {
        setConversations((previous) => previous.map((chat) => {
            if (chat.id !== activeId) return chat;
            const updated = updater(chat);
            return { ...updated, updatedAt: new Date().toISOString() };
        }));
    };

    const handleNewChat = async () => {
        try {
            const created = await historyRequest("/conversations/", {
                method: "POST",
                body: JSON.stringify({ title: "New conversation" }),
            });
            const conversation = normalizeConversation(created);
            setConversations((previous) => [conversation, ...previous]);
            setActiveId(conversation.id);
            setInput("");
            setSidebarOpen(false);
            inputRef.current?.focus();
        } catch (error) {
            setNotice(`Could not create conversation: ${error.message}`);
        }
    };

    const handleDeleteConversation = async (id) => {
        const target = conversations.find((chat) => chat.id === id);
        if (!target || !window.confirm(`Delete "${target.title}"? This cannot be undone.`)) return;
        try {
            await historyRequest(`/conversations/${id}/`, { method: "DELETE" });
            const remaining = conversations.filter((chat) => chat.id !== id);
            let next = remaining;
            if (!next.length) {
                next = [normalizeConversation(await historyRequest("/conversations/", {
                    method: "POST", body: JSON.stringify({ title: "New conversation" }),
                }))];
            }
            setConversations(next);
            if (id === activeId) setActiveId(next[0].id);
            setNotice("Conversation deleted.");
        } catch (error) {
            setNotice(`Could not delete conversation: ${error.message}`);
        }
    };

    const handleRenameConversation = async (chat) => {
        const title = window.prompt("Enter a name for this conversation:", chat.title);
        if (title === null || !title.trim()) return;
        try {
            const updated = await historyRequest(`/conversations/${chat.id}/`, {
                method: "PATCH", body: JSON.stringify({ title: title.trim().slice(0, 120) }),
            });
            setConversations((previous) => previous.map((item) => item.id === chat.id
                ? { ...item, title: updated.title, updatedAt: updated.updated_at } : item));
            setNotice("Conversation renamed.");
        } catch (error) {
            setNotice(`Could not rename conversation: ${error.message}`);
        }
    };

    const handleExport = (chat = activeConversation) => {
        if (!chat) return;
        const content = [
            `Learnova AI — ${chat.title}`,
            `Exported: ${new Date().toLocaleString()}`,
            "",
            ...chat.messages.map((message) =>
                `[${new Date(message.time || Date.now()).toLocaleString()}] ${message.sender === "user" ? "You" : "Learnova AI"}:\n${message.text}\n`
            ),
        ].join("\n");
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(chat.title || "learnova-chat").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 50)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        setNotice("Conversation exported.");
    };

    const handleClearConversation = async () => {
        if (!activeConversation || !window.confirm("Clear all messages in this conversation?")) return;
        try {
            await historyRequest(`/conversations/${activeConversation.id}/messages/`, { method: "DELETE" });
            setConversations((previous) => previous.map((chat) => chat.id === activeConversation.id
                ? { ...chat, messages: [], title: "New conversation", updatedAt: new Date().toISOString() } : chat));
            setNotice("Conversation cleared.");
        } catch (error) {
            setNotice(`Could not clear conversation: ${error.message}`);
        }
    };

    const suggestedQuestions = [
        "Explain Python basics",
        "Help me understand SQL",
        "What is machine learning?",
        "Explain React hooks",
    ];

    const handleSend = async (text = input) => {
        const messageText = text.trim();
        if (!messageText || isTyping || !activeConversation || historyLoading) return;

        const userMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sender: "user",
            text: messageText,
            time: new Date().toISOString(),
        };

        const conversationId = activeConversation.id;
        setConversations((previous) => previous.map((chat) => {
            if (chat.id !== conversationId) return chat;
            const firstUserMessage = chat.messages.find((message) => message.sender === "user");
            return {
                ...chat,
                title: firstUserMessage ? chat.title : messageText.slice(0, 42),
                messages: [...chat.messages, userMessage],
                updatedAt: new Date().toISOString(),
            };
        }));
        setInput("");
        setIsTyping(true);

        try {
            const accessToken = getAccessToken();
            if (!accessToken) throw new Error("Please log in again. Your access token was not found.");
            await historyRequest(`/conversations/${conversationId}/messages/`, {
                method: "POST", body: JSON.stringify({ role: "user", content: messageText }),
            });

            const response = await fetch("http://127.0.0.1:8000/api/chatbot/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ message: messageText }),
            });

            let data = {};
            try { data = await response.json(); } catch { /* non-JSON response */ }

            if (!response.ok) {
                if (response.status === 401) throw new Error("Your session expired. Please log in again.");
                throw new Error(data.error || data.detail || data.message || `Request failed (${response.status}).`);
            }

            const answer = data.answer || data.response || data.reply || data.message;
            if (!answer) throw new Error("The AI returned an empty response.");
            await historyRequest(`/conversations/${conversationId}/messages/`, {
                method: "POST", body: JSON.stringify({ role: "assistant", content: answer }),
            });

            setConversations((previous) => previous.map((chat) => chat.id === conversationId ? {
                ...chat,
                messages: [...chat.messages, {
                    id: `msg-${Date.now()}-ai`,
                    sender: "assistant",
                    text: answer,
                    time: new Date().toISOString(),
                }],
                updatedAt: new Date().toISOString(),
            } : chat));
        } catch (error) {
            console.error("Learnova chatbot error:", error);
            setConversations((previous) => previous.map((chat) => chat.id === conversationId ? {
                ...chat,
                messages: [...chat.messages, {
                    id: `msg-${Date.now()}-error`,
                    sender: "assistant",
                    isError: true,
                    text: `Unable to get an AI response: ${error.message}`,
                    time: new Date().toISOString(),
                    failedPrompt: messageText,
                }],
                updatedAt: new Date().toISOString(),
            } : chat));
        } finally {
            setIsTyping(false);
            inputRef.current?.focus();
        }
    };

    const handleRetry = (message) => {
        setConversations((previous) => previous.map((chat) => chat.id === activeId ? {
            ...chat,
            messages: chat.messages.filter((item) => item.id !== message.id),
        } : chat));
        handleSend(message.failedPrompt || input);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="ai-chatbot-page">
            <div className="ai-chatbot-container ai-chatbot-layout">
                <aside className={`ai-chat-sidebar ${sidebarOpen ? "is-open" : ""}`}>
                    <div className="ai-sidebar-top">
                        <h2>Conversations</h2>
                        <button type="button" className="ai-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close history">×</button>
                    </div>
                    <button type="button" className="ai-new-chat-button" onClick={handleNewChat}>＋ New chat</button>
                    <input
                        className="ai-history-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search conversations..."
                        aria-label="Search conversations"
                    />
                    <div className="ai-conversation-list">
                        {filteredConversations.map((chat) => (
                            <div key={chat.id} className={`ai-conversation-item ${chat.id === activeId ? "active" : ""}`}>
                                <button type="button" className="ai-conversation-select" onClick={() => { setActiveId(chat.id); setSidebarOpen(false); }}>
                                    <span className="ai-conversation-title">{chat.title}</span>
                                    <small>{new Date(chat.updatedAt).toLocaleDateString()}</small>
                                </button>
                                <div className="ai-conversation-actions">
                                    <button type="button" title="Rename conversation" aria-label="Rename conversation" onClick={() => handleRenameConversation(chat)}>✎</button>
                                    <button type="button" title="Delete conversation" aria-label="Delete conversation" onClick={() => handleDeleteConversation(chat.id)}>×</button>
                                </div>
                            </div>
                        ))}
                        {!filteredConversations.length && <p className="ai-empty-history">No matching conversations.</p>}
                    </div>
                    <p className="ai-sidebar-note">Saved in this browser</p>
                </aside>

                <section className="ai-chat-main">
                    <header className="ai-chatbot-header">
                        <div className="ai-assistant-profile">
                            <button type="button" className="ai-history-toggle" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle conversation history">☰</button>
                            <div className="ai-assistant-avatar"><span>✦</span></div>
                            <div className="ai-assistant-info">
                                <h1>Learnova AI Assistant</h1>
                                <div className="ai-assistant-status"><span className="ai-status-dot"></span><span>{isTyping ? "Thinking..." : "Ready to help you learn"}</span></div>
                            </div>
                        </div>
                        <div className="ai-header-actions">
                            <button type="button" onClick={() => handleExport()} title="Export conversation">Export</button>
                            <button type="button" onClick={handleClearConversation} title="Clear messages">Clear</button>
                        </div>
                    </header>

                    {notice && <div className="ai-chat-notice" role="status">{notice}</div>}

                    <main className="ai-chat-messages" aria-label="Chat messages" aria-live="polite">
                        <div className="ai-chat-date"><span>{activeConversation?.title || "Conversation"}</span></div>
                        {messages.map((message) => (
                            <div key={message.id} className={`ai-message-row ${message.sender === "user" ? "ai-message-user-row" : "ai-message-assistant-row"}`}>
                                {message.sender !== "user" && <div className="ai-message-avatar">✦</div>}
                                <div className="ai-message-content">
                                    <div className="ai-message-sender">{message.sender === "user" ? "You" : "Learnova AI"}</div>
                                    <div className={`ai-message-bubble ${message.isError ? "ai-error-bubble" : ""}`}>
                                        {message.sender === "user" ? message.text : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.text}</ReactMarkdown>
                                        )}
                                    </div>
                                    {message.isError && (
                                        <button type="button" className="ai-retry-button" onClick={() => handleRetry(message)} disabled={isTyping}>↻ Retry</button>
                                    )}
                                    <span className="ai-message-time">{formatTime(message.time)}</span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="ai-message-row ai-message-assistant-row">
                                <div className="ai-message-avatar">✦</div>
                                <div className="ai-message-content">
                                    <div className="ai-message-sender">Learnova AI</div>
                                    <div className="ai-typing-indicator" aria-label="Assistant is typing"><span></span><span></span><span></span></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>

                    {messages.filter((message) => message.sender === "user").length === 0 && (
                        <section className="ai-suggestions">
                            <h2>Not sure where to start?</h2>
                            <p>Choose a question to begin your learning journey.</p>
                            <div className="ai-suggestion-list">
                                {suggestedQuestions.map((question) => (
                                    <button key={question} type="button" className="ai-suggestion-button" onClick={() => handleSend(question)} disabled={isTyping}>
                                        <span className="ai-suggestion-icon">✧</span>{question}<span className="ai-suggestion-arrow">↗</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <footer className="ai-chat-footer">
                        <form className="ai-chat-input-form" onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
                            <textarea
                                ref={inputRef}
                                className="ai-chat-input"
                                placeholder="Ask me anything about your studies..."
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        handleSend();
                                    }
                                }}
                                rows={1}
                                aria-label="Type your message"
                                disabled={isTyping}
                            />
                            <button type="submit" className="ai-chat-send-button" disabled={!input.trim() || isTyping} aria-label="Send message" title="Send message"><span>➤</span></button>
                        </form>
                        <p className="ai-chat-disclaimer">Conversations are saved in this browser. Export important chats to keep a backup.</p>
                    </footer>
                </section>
            </div>
        </div>
    );
}

export default AIChatbot;
