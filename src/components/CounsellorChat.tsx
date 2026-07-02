"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

interface CounsellorChatProps {
  studentProfile: any;
  uid: string;
}

const formatMessage = (text: string) => {
  if (!text) return null;
  // Handle literal "\n" strings from API and actual newlines
  const lines = text.replace(/\\n/g, '\n').split('\n');
  return lines.map((line, i) => {
    // Basic bold parsing for **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="mb-2 last:mb-0 break-words leading-relaxed">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-black text-white">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
};

export default function CounsellorChat({ studentProfile, uid }: CounsellorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Best CSE colleges for 185 cutoff",
    "TNEA 2026 schedule",
    "Scholarship for BC students",
    "PSG vs CIT comparison"
  ];

  useEffect(() => {
    // Load history
    const loadHistory = async () => {
      if (!uid) return;
      try {
        const docRef = doc(db, "chats", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().messages) {
          const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
          const filteredMessages = docSnap.data().messages.filter((msg: any) => {
            if (!msg.timestamp) return true;
            return new Date(msg.timestamp) > fifteenDaysAgo;
          });
          
          if (filteredMessages.length > 0) {
            setMessages(filteredMessages);
            setUnreadCount(0); // If they've loaded history, reset unread
            return;
          }
        }
        
        // No history or all history expired, add welcome message
        setMessages([{
          role: "assistant",
          content: `Hi ${studentProfile?.name?.split(' ')[0] || 'there'}! I'm your personal admission counsellor. Ask me anything about:
• Which college is best for your marks
• How to apply for scholarships
• What entrance exams you need
• Cutoff trends and predictions
• Any admission-related question`,
          timestamp: new Date().toISOString()
        }]);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    loadHistory();
  }, [uid, studentProfile]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const saveHistory = async (newMessages: Message[]) => {
    if (!uid) return;
    try {
      // Keep only last 20 messages to save space
      const trimmed = newMessages.slice(-20);
      await setDoc(doc(db, "chats", uid), {
        messages: trimmed,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save chat history", err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/counsellor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          studentProfile
        })
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      const aiMsg: Message = { role: "assistant", content: data.reply, timestamp: data.timestamp || new Date().toISOString() };
      const newHistory = [...updatedMessages, aiMsg];
      setMessages(newHistory);
      saveHistory(newHistory);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-[100] top-1/2 -translate-y-1/2 right-4 sm:right-6 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[380px] h-[520px] bg-[#05071a]/95 backdrop-blur-xl border border-indigo-500/30 rounded-t-[20px] rounded-bl-[20px] shadow-2xl flex flex-col overflow-hidden max-w-[calc(100vw-48px)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white relative shadow-lg shadow-indigo-500/30">
                  <span className="font-black text-sm">AI</span>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#05071a] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">CollegeMatch Counsellor</h3>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Usually replies instantly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="h-8 w-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-br-sm" 
                      : "bg-white/10 text-white/90 border border-white/5 rounded-bl-sm"
                  )}>
                    {formatMessage(msg.content)}
                  </div>
                  {msg.timestamp && (
                    <span className="text-[9px] text-white/30 font-bold mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col mr-auto items-start max-w-[85%]">
                  <div className="px-4 py-4 rounded-2xl bg-white/10 border border-white/5 rounded-bl-sm flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 bg-white/50 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 bg-white/50 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 bg-white/50 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                {suggestedQuestions.map(q => (
                  <button key={q} onClick={() => handleSend(q)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/60 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                  placeholder="Ask anything..."
                  className="w-full h-12 bg-black/20 border border-white/10 rounded-2xl pl-4 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50"
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1.5 h-9 w-9 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Send size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.6)] flex items-center justify-center text-white hover:scale-105 transition-transform relative animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-[#05071a] rounded-full text-[10px] font-black flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
