import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MessageSquare, MonitorUp, ShieldAlert, User, Activity 
} from 'lucide-react';

const Interview = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Fetch user details from session
  const currentUser = localStorage.getItem("username") || "Unknown User";
  const userRole = localStorage.getItem("role") || "Candidate";

  // Live Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    // Determine where to route them after ending the call
    if (userRole === 'Expert') {
      navigate('/expert');
    } else {
      navigate('/candidate'); // Or to a Results page if you have one
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 overflow-hidden flex flex-col">
      
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Top Header Bar */}
      <header className="flex justify-between items-center mb-6 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-bold text-sm tracking-widest uppercase">Live Session</span>
          </div>
          <span className="text-slate-400 font-mono font-bold">{formatTime(timeElapsed)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-cyan-400" size={20} />
          <h1 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase hidden md:block">
            Secure Encrypted Channel
          </h1>
        </div>
      </header>

      {/* Main Video Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Primary Feed (The "Other" Person) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-black/40 border border-white/10 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-md"
        >
          {/* Simulated Video Placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
            <User size={120} className="text-cyan-500 mb-4" />
          </div>
          
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Activity className="text-cyan-400" size={18} />
            <span className="font-bold tracking-widest uppercase">
              {userRole === 'Expert' ? 'Candidate Feed' : 'Expert Feed'}
            </span>
          </div>
        </motion.div>

        {/* Secondary Feed & Side Panel */}
        <div className="flex flex-col gap-6">
          
          {/* Your Feed */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="h-64 bg-black/40 border border-white/10 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center backdrop-blur-md"
          >
            {isVideoOff ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <VideoOff className="text-slate-500" size={24} />
                </div>
                <span className="text-slate-500 font-bold text-sm tracking-widest uppercase">Camera Off</span>
              </div>
            ) : (
              <>
                <User size={60} className="text-slate-600 opacity-50" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                  <span className="font-bold text-sm tracking-widest uppercase text-slate-300">You ({currentUser})</span>
                </div>
                {isMuted && (
                  <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 p-2 rounded-lg border border-red-500/20">
                    <MicOff size={16} />
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* AI Analysis / Chat Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md flex flex-col"
          >
            <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-widest text-sm">
              <MessageSquare size={16} /> Live Transcript
            </h3>
            
            <div className="flex-1 border-t border-white/10 pt-4 space-y-4 overflow-y-auto">
              <p className="text-slate-500 text-sm text-center italic">Session recording initialized...</p>
              {/* Simulated chat logs could go here */}
            </div>

            <div className="mt-4 relative">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/50 text-sm transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Control Dock */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex justify-center items-center gap-4 bg-white/5 border border-white/10 py-4 px-8 rounded-full backdrop-blur-2xl mx-auto w-fit"
      >
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'}`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hidden sm:block">
          <MonitorUp size={24} />
        </button>

        <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

        <button 
          onClick={handleEndCall}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-full transition-all shadow-lg shadow-red-900/20 flex items-center gap-3 uppercase tracking-widest"
        >
          <PhoneOff size={20} /> End Sync
        </button>
      </motion.div>

    </div>
  );
};

export default Interview;