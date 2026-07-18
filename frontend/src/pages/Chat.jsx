import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Bot, Loader2, MessageSquare, Trash2, Plus } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';

export default function Chat() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session');
    
    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            const res = await api.get('/api/chat/sessions');
            if (Array.isArray(res.data)) {
                setSessions(res.data);
            } else {
                setSessions([]);
                console.error("Expected array but got:", res.data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Fetch messages for active session
    useEffect(() => {
        const fetchHistory = async () => {
            if (!sessionId) {
                setMessages([]);
                return;
            }
            setHistoryLoading(true);
            try {
                const res = await api.get(`/api/chat/${sessionId}/history`);
                
                if (Array.isArray(res.data)) {
                    if (res.data.length === 0) {
                        setMessages([{
                            id: 'system-1',
                            role: 'assistant',
                            content: 'Hello! I have analyzed your resume and the job description. What would you like to know?'
                        }]);
                    } else {
                        setMessages(res.data);
                    }
                } else {
                    setMessages([]);
                    console.error("Expected array but got:", res.data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, [sessionId]);

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation(); // prevent navigation
        if (!window.confirm("Are you sure you want to delete this chat session?")) return;
        
        try {
            await api.delete(`/api/chat/${id}`);
            if (sessionId === id) {
                navigate('/dashboard'); // redirect to empty state
            }
            fetchSessions(); // refresh list
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('prompt', userMsg);

            const response = await fetch('/query', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Data not ready yet. Please try again.");
                }
                throw new Error("Query failed");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let assistantMessage = '';

            setMessages(prev => [...prev, { id: Date.now().toString() + 'bot', role: 'assistant', content: '' }]);
            setLoading(false);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                assistantMessage += chunk;
                
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                });
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString() + 'err', role: 'assistant', content: error.message || 'Sorry, I encountered an error. Please try again.' }]);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden relative">
            {/* History Sidebar */}
            <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-sm p-4 flex flex-col h-full overflow-hidden">
                <button 
                    onClick={() => navigate('/dashboard/upload')}
                    className="w-full flex items-center gap-2 justify-center py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg mb-4 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Analysis
                </button>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">Recent Chats</h3>
                <div className="flex-1 overflow-y-auto space-y-1">
                    {sessions.map(s => (
                        <div 
                            key={s.id}
                            onClick={() => navigate(`/dashboard?session=${s.id}`)}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                sessionId === s.id ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <MessageSquare className="w-4 h-4 shrink-0" />
                                <span className="text-sm truncate">{s.title || "Chat Session"}</span>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteSession(e, s.id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                                title="Delete Session"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <p className="text-xs text-zinc-600 px-2 mt-4 text-center">No chat history yet.</p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-zinc-950/30 p-8 pt-4 relative">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50 mb-4 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-white">Analysis Chat</h1>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-4">
                    {!sessionId ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                            <MessageSquare className="w-12 h-12 text-zinc-700" />
                            <p>Select a chat from the sidebar or start a new analysis.</p>
                        </div>
                    ) : historyLoading ? (
                        <div className="flex justify-center mt-20">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                        </div>
                    ) : messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                                    <Bot className="w-5 h-5" />
                                </div>
                            )}
                            <div 
                                className={`max-w-[85%] rounded-2xl p-4 ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-100 rounded-tl-sm shadow-xl backdrop-blur-sm'
                                }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-1">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 shadow-xl backdrop-blur-sm">
                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="pt-4 mt-auto shrink-0">
                    <form 
                        onSubmit={handleSubmit}
                        className="relative bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-2 flex items-end gap-2 shadow-xl"
                    >
                        <textarea 
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                    e.target.style.height = 'auto';
                                }
                            }}
                            placeholder="Ask about your resume..."
                            className="flex-1 bg-transparent border-none text-white resize-none max-h-32 min-h-[44px] p-3 focus:outline-none focus:ring-0 text-sm"
                            rows="1"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || !sessionId || loading || historyLoading}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 mb-1 mr-1"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-center text-xs text-zinc-500 mt-3">
                        AI can make mistakes. Always review the advice carefully.
                    </p>
                </div>
            </div>
        </div>
    );
}
