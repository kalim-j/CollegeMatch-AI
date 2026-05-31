"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your CollegeMatch-AI counselor. How can I help you with your college search today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    ...messages,
                    userMsg
                ]
            })
        });

        const data = await response.json();
        const aiMsg = { role: "assistant", content: data.choices[0].message.content };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-30 bottom-20 right-4 sm:bottom-6 sm:right-6 h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-[0_8px_32px_rgba(124,92,252,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-[400px] bg-[#0f1117] border-l border-white/10 z-[60] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-white">AI Counselor</h3>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Always Online</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${
                      msg.role === "user" 
                        ? "bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-600/10" 
                        : "bg-white/5 text-slate-300 border border-white/10 rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                        </div>
                    </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about JEE, TNEA, Colleges..."
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 text-white outline-none focus:border-purple-500 transition-all font-bold"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-2 h-10 w-10 bg-purple-500 text-white rounded-xl flex items-center justify-center hover:bg-purple-600 transition-all disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
