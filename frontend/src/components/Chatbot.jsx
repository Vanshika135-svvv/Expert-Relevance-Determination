import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Greetings. I am the Aegis AI Assistant. How can I assist you with the Nexus RAC system today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when a new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll when messages change, or when the window is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Add user's message to the chat
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    // Get the user's role if they are logged in (defaults to 'Guest' on the homepage)
    const userRole = localStorage.getItem('role') || 'Guest';

    try {
      // Send message to your Flask backend on Render
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/chat', {
        message: userMessage,
        role: userRole
      });

      // Add the bot's response to the chat
      setMessages(prev => [...prev, { text: res.data.response, sender: 'bot' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { text: "System Error: Unable to reach the Neural Matrix. Please ensure the backend server is online.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    // ADJUSTED POSITIONING: Moved away from the extreme edges and given highest z-index
    <div className="fixed bottom-8 right-8 z-[9999] font-sans">
      <AnimatePresence>
        {/* The Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            // ADJUSTED WINDOW: Added max-height so it doesn't clip off the top of the screen
            className="absolute bottom-20 right-0 w-[340px] md:w-[400px] h-[500px] max-h-[75vh] bg-[#0B1021]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-5 bg-gradient-to-r from-cyan-900/50 to-[#0B1021] border-b border-cyan-500/20 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Bot size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Aegis AI</h3>
                  <p className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-black/20">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 border border-cyan-500/30 text-cyan-400'}`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none shadow-md'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-800 border border-cyan-500/30 text-cyan-400">
                    <Bot size={14} />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/5 rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Chat Input Field */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#070b14] shrink-0">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Query Aegis AI..."
                  className="w-full bg-black/40 border border-cyan-500/20 rounded-xl py-3.5 pl-4 pr-14 text-sm text-white outline-none focus:border-cyan-500/60 transition-all placeholder:text-slate-600"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all border-2 border-cyan-300 relative z-[10000]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default Chatbot;