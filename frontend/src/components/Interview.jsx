import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, MonitorUp, 
  MessageSquare, Send, PhoneOff, Terminal, 
  User, Sparkles, Activity, ShieldCheck 
} from 'lucide-react';

const Interview = () => {
  const navigate = useNavigate();
  
  // Refs for Media Streams
  const mainVideoRef = useRef(null);
  const selfVideoRef = useRef(null);
  const scrollRef = useRef(null);

  // Hardware & Session States
  const [stream, setStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Communication States
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'Encrypted neural link established.', time: 'v1.4' }
  ]);
  const [currentMsg, setCurrentMsg] = useState('');
  const [transcript, setTranscript] = useState([
    "Node initialization sequence complete...",
    "Awaiting Expert Board connection..."
  ]);

  const currentUser = localStorage.getItem("username") || "Candidate";

  // --- 1. SESSION TIMER ---
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- 2. HARDWARE ACCESS (WebRTC Logic) ---
  useEffect(() => {
    startSession();
    return () => stopAllMedia();
  }, []);

  const startSession = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (mainVideoRef.current) mainVideoRef.current.srcObject = mediaStream;
      if (selfVideoRef.current) selfVideoRef.current.srcObject = mediaStream;
    } catch (err) {
      setTranscript(prev => ["ERROR: Media access denied. Check permissions.", ...prev]);
    }
  };

  const stopAllMedia = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isCamOn;
      setIsCamOn(!isCamOn);
    }
  };

  const handleScreenShare = async () => {
    try {
      if (!isSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (mainVideoRef.current) mainVideoRef.current.srcObject = screenStream;
        setIsSharing(true);
        setTranscript(prev => ["User started screen broadcast...", ...prev]);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsSharing(false);
          if (mainVideoRef.current) mainVideoRef.current.srcObject = stream;
        };
      } else {
        setIsSharing(false);
        if (mainVideoRef.current) mainVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("Sharing cancelled");
    }
  };

  // --- 3. MESSAGING & TRANSCRIPT LOGIC ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!currentMsg.trim()) return;

    const newMsg = {
      sender: currentUser,
      text: currentMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setTranscript(prev => [`${currentUser}: ${currentMsg}`, ...prev]);
    setCurrentMsg('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 flex flex-col font-sans selection:bg-cyan-500 overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-blue-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-6 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-black text-[10px] tracking-widest uppercase">Live Session</span>
          </div>
          <span className="text-cyan-400 font-mono font-bold tracking-widest">{formatTime(timeElapsed)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-400" size={18} />
          <h1 className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase hidden md:block">
            Secure Neural Protocol
          </h1>
        </div>
      </header>

      {/* --- MAIN INTERFACE GRID --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 mb-24 overflow-hidden">
        
        {/* VIDEO PANEL (Left 3 Columns) */}
        <div className="lg:col-span-3 relative group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full bg-black/60 border border-white/10 rounded-[3rem] overflow-hidden relative shadow-2xl backdrop-blur-md"
          >
            {/* Main Video Feed (Expert or Screen) */}
            <video 
              ref={mainVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />

            {/* Self-View Overlay (Picture-in-Picture) */}
            <div className="absolute bottom-8 right-8 w-48 h-32 md:w-64 md:h-40 bg-slate-900 rounded-[2rem] border-2 border-white/10 overflow-hidden shadow-2xl z-20">
               <AnimatePresence>
                 {isCamOn ? (
                    <video ref={selfVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                       <User size={32} className="text-slate-700" />
                    </div>
                 )}
               </AnimatePresence>
               <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10">
                 Local Node: {currentUser}
               </div>
            </div>

            {/* Expert Tag */}
            <div className="absolute top-8 left-8 flex gap-3">
               <span className="px-5 py-2.5 bg-black/60 backdrop-blur-xl rounded-2xl text-[10px] font-black border border-white/10 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} className="text-cyan-400" /> Remote Expert Feed
               </span>
               {isSharing && (
                 <motion.span initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} className="px-5 py-2.5 bg-blue-600/80 backdrop-blur-xl rounded-2xl text-[10px] font-black border border-blue-400/50 uppercase tracking-[0.2em] animate-pulse">
                   Transmitting Screen
                 </motion.span>
               )}
            </div>
          </motion.div>
        </div>

        {/* SIDEBAR (Right Column) */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          
          {/* Live Transcript View */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col backdrop-blur-md shadow-xl overflow-hidden">
            <h3 className="text-[10px] font-black text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Terminal size={14} /> Neural Transcript
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {transcript.map((line, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  <span className="text-cyan-800 mr-2">[{new Date().toLocaleTimeString([], {second:'2-digit'})}]</span> {line}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Team Comms (Messaging) */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col backdrop-blur-md shadow-xl overflow-hidden">
            <h3 className="text-[10px] font-black text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
              <MessageSquare size={14} /> Team Comms
            </h3>
            
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.sender === currentUser ? 'items-end' : 'items-start'}`}>
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1 px-1">{msg.sender}</p>
                   <div className={`p-3 rounded-2xl text-[12px] max-w-[90%] ${
                     msg.sender === currentUser ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' : 'bg-white/5 text-slate-300'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
            </div>

            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" 
                value={currentMsg}
                onChange={(e) => setCurrentMsg(e.target.value)}
                placeholder="Transmit message..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-xs outline-none focus:border-blue-500/50 transition-all font-medium"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- CONTROL DOCK --- */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0a0f1e]/80 backdrop-blur-3xl border border-white/10 p-4 rounded-[2.5rem] flex items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50">
        <div className="flex items-center gap-3 px-6 border-r border-white/10">
          <button 
            onClick={toggleMic}
            className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
          >
            {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>
          <button 
            onClick={toggleCam}
            className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
          >
            {isCamOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>
          <button 
            onClick={handleScreenShare}
            className={`p-4 rounded-2xl transition-all ${isSharing ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
          >
            <MonitorUp size={22} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/result')}
          className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-red-950/40 active:scale-95 text-xs"
        >
          <PhoneOff size={18} /> End Sync
        </button>
      </footer>

    </div>
  );
};

export default Interview;