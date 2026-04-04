import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const DashboardLayout = ({ children, activeTab }) => {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* Glassmorphism Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 h-screen p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Aegis AI
          </h1>
        </div>
        
        <nav className="space-y-4">
          {['Overview', 'Candidate Matcher', 'Interview Boards', 'System Logs'].map((item) => (
            <button 
              key={item}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                activeTab === item ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Triggers animation on tab change
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;