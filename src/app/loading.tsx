"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#05071a] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background gradients for the loading screen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Pulsing logo icon */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)]"
        >
          <span className="text-white font-black text-3xl">CM</span>
        </motion.div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            CollegeMatch<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]">-AI</span>
          </h1>
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm font-bold text-white/50 uppercase tracking-widest"
          >
            Loading...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
