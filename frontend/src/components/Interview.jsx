import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Activity, BrainCircuit, Terminal, MessageSquare, Send, Heart, ThumbsUp, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [jitsiApi, setJitsiApi] = useState(null);

  // Chat & Reaction States
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [systemLogs, setSystemLogs] = useState([
    "Initializing secure Aegis V2 protocol...",
    "Connecting to remote routing nodes...",
  ]);

  // Identity Logic
  const myName = localStorage.getItem('username') || 'Unknown Node';
  const myRole = localStorage.getItem('role') || 'Candidate';
  const targetCandidate = location.state?.target;
  const roomBaseName = myRole === 'Expert' ? (targetCandidate || myName) : myName;
  const sanitizedRoomName = `Nexus-SyncRoom-${roomBaseName.replace(/[^a-zA-Z0-9]/g, '')}`;

  const handleDisconnect = () => {
    if (jitsiApi) jitsiApi.dispose();
    if (myRole === 'Expert') navigate('/expert-dashboard');
    else navigate('/result');
  };

  // Add Log Helper
  const addLog = (msg) => {
    setSystemLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- NATIVE JITSI INITIALIZATION ---
  useEffect(() => {
    let api = null;

    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      await loadJitsiScript();
      
      const domain = 'meet.jit.si';
      const options = {
        roomName: sanitizedRoomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: myName },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, 
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_CHROME_EXTENSION_BANNER: false,
          // Hide native chat/buttons so our custom UI shines
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'tileview', 'hangup'],
        },
      };

      api = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiApi(api);

      // Event Listeners
      api.addListener('videoConferenceJoined', () => {
        setIsLoading(false);
        addLog("P2P Video Bridge established successfully.");
        addLog("Awaiting moderator unlock if room is empty.");
      });

      api.addListener('participantJoined', (p) => addLog(`Node connected: ${p.displayName}`));
      api.addListener('participantLeft', (p) => addLog(`Node disconnected: ${p.displayName}`));
      api.addListener('videoConferenceLeft', handleDisconnect);

      // Listen for incoming Chat and Emoji signals from Jitsi bridge
      api.addListener('incomingMessage', (event) => {
        const text = event.message;
        // If it's a special reaction message, trigger emoji
        if (text.startsWith('SYS_REACTION::')) {
          const emoji = text.split('::')[1];
          triggerFloatingEmoji(emoji, event.nick);
        } else {
          // Standard chat message
          setChatMessages(prev => [...prev, { sender: event.nick, text: text }]);
        }
      });
    };

    initializeJitsi();
    return () => { if (api) api.dispose(); };
  }, [sanitizedRoomName, myName]);


  // --- CHAT & REACTION FUNCTIONS ---
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !jitsiApi) return;
    
    // Send message across Jitsi P2P network
    jitsiApi.executeCommand('sendChatMessage', currentMessage, '', true);
    
    // Also add to local chat view instantly
    setChatMessages(prev => [...prev, { sender: myName, text: currentMessage }]);
    setCurrentMessage("");
  };

  const sendReaction = (emoji) => {
    if (!jitsiApi) return;
    // Send secret message string to trigger other person's emojis
    jitsiApi.executeCommand('sendChatMessage', `SYS_REACTION::${emoji}`, '', true);
    // Trigger locally
    triggerFloatingEmoji(emoji, myName);
    addLog(`${myName} deployed a reaction.`);
  };

  const triggerFloatingEmoji = (emoji, sender) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji, sender }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 4000);
  };


  return (
    <div className="min-h-screen w-full bg-[#020617] text-white flex flex-col font-sans overflow-y-auto selection:bg-cyan-500 pb-12 relative">
      
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <header className="h-20 px-6 md:px-10 border-b border-white/5 bg-white/[0.01] backdrop-blur-xl flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={20} />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Live Neural Sync
            </h1>
            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> P2P Encrypted • {formatTime(sessionTime)}
            </p>
          </div>
        </div>

        <button 
          onClick={handleDisconnect}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
        >
          <ArrowLeft size={14} /> Terminate
        </button>
      </header>

      {/* --- MAIN GRID LAYOUT --- */}
      <main className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 max-w-[1800px] mx-auto w-full">
        
        {/* === LEFT COLUMN (Video & Reactions) === */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Info Banner for Moderator Rule */}
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-start md:items-center gap-4">
            <ShieldCheck className="text-blue-400 shrink-0 mt-1 md:mt-0" />
            <p className="text-xs text-blue-100 font-medium">
              <strong className="text-blue-400 uppercase tracking-widest text-[10px] block md:inline mb-1 md:mb-0 md:mr-2">Security Notice:</strong>
              If you are the first person here and see a "Waiting for Host" screen, you must click <strong className="text-white">"I am the host"</strong> and log in with Google to unlock the room.
            </p>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video min-h-[400px] md:min-h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)] bg-black/60 backdrop-blur-xl">
            
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020617] backdrop-blur-md"
                >
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-cyan-500/30">
                    <BrainCircuit size={40} className="text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-cyan-400 mb-2">Establishing Link...</h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Emojis Layer */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              <AnimatePresence>
                {floatingEmojis.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 100, scale: 0.5, x: Math.random() * 100 - 50 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -300, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="absolute bottom-10 left-1/2 flex flex-col items-center"
                  >
                    <span className="text-4xl drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">{e.emoji}</span>
                    <span className="text-[8px] font-black uppercase text-white tracking-widest bg-black/50 px-2 rounded-full mt-1">
                      {e.sender}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Jitsi Iframe Injects Here */}
            <div ref={jitsiContainerRef} className="w-full h-full absolute inset-0" />
          </div>

          {/* Quick Reaction Bar */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-md flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-2">Deploy Reaction</span>
            <div className="flex gap-4">
              {[
                { icon: <ThumbsUp size={20} />, label: '👍' },
                { icon: <Heart size={20} />, label: '❤️' },
                { icon: <Flame size={20} />, label: '🔥' },
                { icon: <Zap size={20} />, label: '⚡' }
              ].map((reaction, i) => (
                <button 
                  key={i}
                  onClick={() => sendReaction(reaction.label)}
                  className="w-12 h-12 bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 active:scale-90"
                >
                  {reaction.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Chat & Logs) === */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Team Comms (Live Chat) */}
          <div className="flex-1 min-h-[350px] bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md flex flex-col">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
              <MessageSquare size={14} /> Team Comms
            </h3>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center mt-10">No messages routed yet.</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === myName ? 'items-end' : 'items-start'}`}>
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1 px-1 tracking-widest">{msg.sender}</p>
                    <div className={`p-3 rounded-2xl text-xs max-w-[90%] font-medium ${
                      msg.sender === myName 
                        ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-sm' 
                        : 'bg-white/10 text-white border border-white/5 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendChatMessage} className="relative mt-auto">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Transmit message..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-xs outline-none focus:border-cyan-500/50 transition-all font-medium text-white"
              />
              <button 
                type="submit" 
                disabled={!currentMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Neural Terminal (System Logs) */}
          <div className="h-48 bg-black/40 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md flex flex-col shadow-inner">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" /> Neural Terminal
            </h3>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar flex flex-col-reverse">
              {/* Display logs in reverse order (newest at bottom) */}
              {[...systemLogs].reverse().map((log, i) => (
                <div key={i} className={`${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Interview;