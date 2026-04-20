import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Activity, BrainCircuit, Terminal, MessageSquare, 
  Send, Heart, ThumbsUp, Flame, Zap, Mic, MicOff, Video, VideoOff, 
  MonitorUp, Focus, CircleDot, Users, Copy, Check, Hand, Maximize, Minimize 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  const videoWrapperRef = useRef(null); // Reference for fullscreen
  
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(1800); 
  const [jitsiApi, setJitsiApi] = useState(null);

  // --- NEW: Modern Meeting States ---
  const [participantCount, setParticipantCount] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Hardware States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Chat & Reaction States
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [activePrompt, setActivePrompt] = useState("");
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

  const addLog = (msg) => {
    setSystemLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] ${msg}`]);
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

  // --- NATIVE JITSI INITIALIZATION (CONNECTION KEPT EXACTLY THE SAME) ---
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
          disableModeratorIndicator: false, 
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: ['tileview', 'hangup'],
        },
      };

      api = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiApi(api);

      api.addListener('videoConferenceJoined', () => {
        setIsLoading(false);
        addLog("P2P Video Bridge established successfully.");
      });

      api.addListener('participantJoined', (p) => {
        addLog(`Node connected: ${p.displayName}`);
        setParticipantCount(prev => prev + 1);
      });
      
      api.addListener('participantLeft', (p) => {
        addLog(`Node disconnected: ${p.displayName}`);
        setParticipantCount(prev => Math.max(1, prev - 1));
      });

      api.addListener('videoConferenceLeft', handleDisconnect);
      
      api.addListener('audioMuteStatusChanged', ({ muted }) => setIsAudioMuted(muted));
      api.addListener('videoMuteStatusChanged', ({ muted }) => setIsVideoMuted(muted));
      api.addListener('screenSharingStatusChanged', ({ on }) => setIsScreenSharing(on));

      api.addListener('incomingMessage', (event) => {
        const text = event.message;
        if (text.startsWith('SYS_REACTION::')) {
          const emoji = text.split('::')[1];
          triggerFloatingEmoji(emoji, event.nick);
        } else if (text.startsWith('SYS_PROMPT::')) {
          const promptText = text.split('::')[1];
          setActivePrompt(promptText);
          addLog(`Expert deployed a live prompt.`);
          setTimeout(() => setActivePrompt(""), 15000);
        } else {
          setChatMessages(prev => [...prev, { sender: event.nick, text: text }]);
        }
      });
    };

    initializeJitsi();
    return () => { if (api) api.dispose(); };
  }, [sanitizedRoomName, myName]);

  // --- HARDWARE & MODERN CONTROLS ---
  const toggleMic = () => jitsiApi?.executeCommand('toggleAudio');
  const toggleCam = () => jitsiApi?.executeCommand('toggleVideo');
  const toggleShare = () => jitsiApi?.executeCommand('toggleShareScreen');
  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
    jitsiApi?.executeCommand('toggleRaiseHand');
    addLog(isHandRaised ? "You lowered your hand." : "You raised your hand.");
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    addLog("Secure room link copied to clipboard.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoWrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- CHAT & REACTION FUNCTIONS ---
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !jitsiApi) return;
    
    if (currentMessage.startsWith('/prompt ') && myRole === 'Expert') {
      const promptText = currentMessage.replace('/prompt ', '');
      jitsiApi.executeCommand('sendChatMessage', `SYS_PROMPT::${promptText}`, '', true);
      setActivePrompt(promptText);
      addLog(`You deployed prompt: "${promptText}"`);
      setCurrentMessage("");
      setTimeout(() => setActivePrompt(""), 15000);
      return;
    }
    
    jitsiApi.executeCommand('sendChatMessage', currentMessage, '', true);
    setChatMessages(prev => [...prev, { sender: myName, text: currentMessage }]);
    setCurrentMessage("");
  };

  const sendReaction = (emoji) => {
    if (!jitsiApi) return;
    jitsiApi.executeCommand('sendChatMessage', `SYS_REACTION::${emoji}`, '', true);
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
    // STRICT WRAPPER: Fixed height, no overflow allowed
    <div className="h-screen max-h-screen w-full bg-[#020617] text-white flex flex-col font-sans overflow-hidden selection:bg-cyan-500 relative">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- TOP NAVIGATION (Strict Height) --- */}
      <header className="h-20 shrink-0 px-6 md:px-10 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between z-20">
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
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> P2P Encrypted • {formatTime(sessionTime)}
              </p>
              {/* NEW: Participant Counter */}
              <div className="hidden md:flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest text-slate-300">
                <Users size={10} className="text-cyan-400" /> {participantCount} Nodes
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: Copy Link Button */}
          <button 
            onClick={copyRoomLink}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95"
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {isCopied ? "Copied" : "Invite"}
          </button>

          <button 
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
          >
            <ArrowLeft size={14} /> Terminate
          </button>
        </div>
      </header>

      {/* --- MAIN GRID LAYOUT (Ultra Strict Bounds) --- */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 md:p-8 relative z-10 max-w-[1800px] mx-auto w-full min-h-0 overflow-hidden">
        
        {/* === LEFT COLUMN (Video & Command Deck) === */}
        <div className="flex-[2] lg:flex-[2.5] flex flex-col gap-4 min-h-0 min-w-0 relative h-full">
          
          {/* Security Banner / Active Prompt Area */}
          <div className={`border p-4 rounded-2xl flex items-start md:items-center gap-4 shrink-0 transition-all duration-500 ${
            activePrompt ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'bg-blue-500/10 border-blue-500/30 shadow-inner'
          }`}>
            {activePrompt ? (
              <>
                <Focus className="text-cyan-400 shrink-0 mt-1 md:mt-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <strong className="text-cyan-400 uppercase tracking-widest text-[10px] block mb-1">Live Expert Prompt</strong>
                  <p className="text-sm text-white font-bold tracking-wide truncate">{activePrompt}</p>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck className="text-blue-400 shrink-0 mt-1 md:mt-0" />
                <p className="text-xs text-blue-100 font-medium">
                  <strong className="text-blue-400 uppercase tracking-widest text-[10px] block md:inline mb-1 md:mb-0 md:mr-2">Security Notice:</strong>
                  If you see "Waiting for Host", click <strong className="text-white bg-black/40 px-2 py-0.5 rounded">"I am the host"</strong> to unlock the room.
                </p>
              </>
            )}
          </div>

          {/* Video Container (Strictly restricted to remaining height) */}
          <div ref={videoWrapperRef} className="flex-1 w-full relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)] bg-black min-h-0 group">
            
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020617] backdrop-blur-md"
                >
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
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

            {/* Holographic Prompt Overlay */}
            <AnimatePresence>
              {activePrompt && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-3/4 max-w-lg"
                >
                  <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/50 p-6 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.4)] text-center">
                    <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-2 animate-pulse">Incoming Expert Prompt</p>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">{activePrompt}</h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* NEW: Fullscreen Toggle Overlay */}
            <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={toggleFullscreen}
                className="bg-black/60 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 backdrop-blur-md p-2.5 rounded-xl text-slate-300 hover:text-cyan-400 transition-all"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>

            {/* Jitsi Iframe Injects Here */}
            <div ref={jitsiContainerRef} className="w-full h-full absolute inset-0" />
          </div>

          {/* COMMAND DECK: Hardware + Reactions */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-3 md:p-4 backdrop-blur-md flex items-center justify-between shrink-0 flex-wrap gap-4 overflow-hidden">
            
            {/* Hardware Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={toggleMic} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'}`}>
                {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={toggleCam} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isVideoMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'}`}>
                {isVideoMuted ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1 md:mx-2 hidden md:block" />
              
              <button onClick={toggleShare} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isScreenSharing ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'}`}>
                <MonitorUp size={18} />
              </button>
              
              {/* NEW: Raise Hand Button */}
              <button onClick={toggleHand} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isHandRaised ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'}`}>
                <Hand size={18} />
              </button>
            </div>

            {/* Reaction Controls */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2 hidden lg:block">Deploy Reaction</span>
              <div className="flex gap-2">
                {[
                  { icon: <ThumbsUp size={16} />, label: '👍', color: 'hover:text-blue-400 border-blue-500/30' },
                  { icon: <Heart size={16} />, label: '❤️', color: 'hover:text-red-400 border-red-500/30' },
                  { icon: <Flame size={16} />, label: '🔥', color: 'hover:text-orange-400 border-orange-500/30' },
                  { icon: <Zap size={16} />, label: '⚡', color: 'hover:text-yellow-400 border-yellow-500/30' }
                ].map((reaction, i) => (
                  <button 
                    key={i}
                    onClick={() => sendReaction(reaction.label)}
                    className={`w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent hover:border ${reaction.color} rounded-xl md:rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 active:scale-90 shadow-lg`}
                  >
                    {reaction.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Chat & Logs) === */}
        <div className="hidden lg:flex flex-[1] flex-col gap-4 relative min-w-0 h-full">
          
          <div className="flex-[2] bg-white/5 border border-white/10 rounded-xl md:rounded-[2.5rem] p-4 md:p-6 backdrop-blur-md flex flex-col shadow-xl min-h-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <MessageSquare size={14} /> Team Comms
              </h3>
              {myRole === 'Expert' ? (
                <span className="text-[7px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded uppercase tracking-widest border border-cyan-500/20">
                  /prompt | /clear
                </span>
              ) : (
                <span className="text-[7px] bg-slate-500/10 text-slate-400 px-2 py-1 rounded uppercase tracking-widest border border-slate-500/20">
                  /clear to wipe local
                </span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar min-h-0">
              {chatMessages.length === 0 ? (
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center mt-10">No messages routed yet.</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === myName ? 'items-end' : 'items-start'}`}>
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1 px-1 tracking-widest">{msg.sender}</p>
                    <div className={`p-2.5 md:p-3 rounded-2xl text-xs max-w-[90%] font-medium shadow-md ${
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

            <form onSubmit={sendChatMessage} className="relative shrink-0">
              <input 
                type="text" 
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Transmit message..."
                className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 pl-4 pr-12 text-xs outline-none focus:border-cyan-500/50 transition-all font-medium text-white shadow-inner"
              />
              <button 
                type="submit" 
                disabled={!currentMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          <div className="flex-[1] bg-black/40 border border-white/10 rounded-xl md:rounded-[2.5rem] p-4 md:p-6 backdrop-blur-md flex flex-col shadow-inner min-h-0 shrink-0">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2 shrink-0">
              <Terminal size={14} className="text-emerald-400" /> Neural Terminal
            </h3>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] md:text-[10px] space-y-2 custom-scrollbar flex flex-col-reverse pr-2 min-h-0">
              {[...systemLogs].reverse().map((log, i) => (
                <div key={i} className={`${i === 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
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