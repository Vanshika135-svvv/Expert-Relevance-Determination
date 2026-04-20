import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Terminal, MessageSquare, Send, Heart, ThumbsUp, Flame, Zap, Mic, MicOff, Video, VideoOff, MonitorUp, Focus, CircleDot, Users, Copy, Check, Hand, Maximize, Minimize, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  const videoWrapperRef = useRef(null);
  
  // Mount Guard to prevent React double-loading crashes
  const jitsiInitRef = useRef(false); 
  const isMounted = useRef(true);
  
  const [sessionTime, setSessionTime] = useState(1800); // 30 Min limit
  const [jitsiApi, setJitsiApi] = useState(null);

  // Modern Meeting States
  const [participantCount, setParticipantCount] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    "Allocating 30-minute secure node...",
    "Connecting to remote routing paths...",
  ]);

  // --- STRICT IDENTITY & ROOM LINKING LOGIC ---
  const myName = localStorage.getItem('username') || 'Unknown Node';
  const myRole = localStorage.getItem('role') || 'Candidate';
  
  // FIX: Permanently save the target into localStorage so refreshes don't break the connection
  const passedTarget = location.state?.target;
  if (passedTarget) {
    localStorage.setItem('nexusTarget', passedTarget);
  }
  const targetCandidate = passedTarget || localStorage.getItem('nexusTarget');

  // STRICT ROOM RULE: The room is ALWAYS the Candidate's name.
  const rawRoomName = myRole === 'Expert' && targetCandidate ? targetCandidate : myName;
  
  // Normalize string to guarantee matching room hashes
  const normalizedRoomName = rawRoomName.trim().toLowerCase().replace(/\s+/g, '');
  const encodedRoomName = btoa(normalizedRoomName).replace(/=/g, '');
  const sanitizedRoomName = `NexusSync-${encodedRoomName}`;

  const handleDisconnect = () => {
    if (jitsiApi) jitsiApi.dispose();
    if (myRole === 'Expert') navigate('/expert-dashboard');
    else navigate('/result');
  };

  const addLog = (msg) => {
    setSystemLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] ${msg}`]);
  };

  // --- COUNTDOWN TIMER ---
  useEffect(() => {
    isMounted.current = true;
    const timer = setInterval(() => {
      setSessionTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDisconnect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
      isMounted.current = false;
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- NATIVE JITSI INITIALIZATION ---
  useEffect(() => {
    if (jitsiInitRef.current) return;
    jitsiInitRef.current = true;

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
      
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = '';
      }
      
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
          prejoinPageEnabled: true, // Must be TRUE so you can click "I am the host"
          disableModeratorIndicator: false, 
          subject: ' ', // Hides confusing Jitsi text
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
        if (isMounted.current) {
          addLog("P2P Video Bridge established successfully.");
        }
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

      api.addListener('incomingMessage', (event) => {
        const text = event.message;
        if (text.startsWith('SYS_REACTION::')) {
          const emoji = text.split('::')[1];
          triggerFloatingEmoji(emoji, event.nick);
        } else if (text.startsWith('SYS_PROMPT::')) {
          const promptText = text.split('::')[1];
          setActivePrompt(promptText);
          addLog(`Expert deployed a live prompt.`);
          setTimeout(() => { if (isMounted.current) setActivePrompt(""); }, 15000);
        } else {
          setChatMessages(prev => [...prev, { sender: event.nick, text: text }]);
        }
      });
    };

    initializeJitsi();
    
    return () => { 
      if (api) api.dispose(); 
      jitsiInitRef.current = false; 
    };
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
  const toggleRecord = () => {
    setIsRecording(!isRecording);
    addLog(!isRecording ? "Session recording initiated." : "Session recording halted.");
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

  // --- CHAT & COMMANDS ---
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !jitsiApi) return;
    
    if (currentMessage === '/clear') {
      setChatMessages([]);
      setCurrentMessage("");
      addLog("Local chat cache purged.");
      return;
    }

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
    <div className="min-h-screen w-full bg-[#020617] text-white flex flex-col font-sans selection:bg-cyan-500 relative md:h-screen md:overflow-hidden overflow-y-auto">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <header className="h-20 shrink-0 px-4 md:px-10 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={20} />
            </div>
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-3">
              Neural Sync
              {isRecording && (
                <span className="hidden md:flex text-[9px] bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded uppercase tracking-widest items-center gap-1 animate-pulse">
                  <CircleDot size={10} /> REC
                </span>
              )}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${sessionTime < 300 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sessionTime < 300 ? 'bg-red-400' : 'bg-emerald-400'} animate-pulse`} /> 
                {formatTime(sessionTime)} REMAINING
              </p>
              <div className="hidden md:flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest text-slate-300">
                <Users size={10} className="text-cyan-400" /> {participantCount} Nodes
              </div>
            </div>
          </div>
        </div>

        {/* IDENTITY VERIFICATION BADGES */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex flex-col items-end border-r border-white/10 pr-6">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Sync Node (Room)</span>
            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 uppercase tracking-widest">
              <Link size={10} /> {normalizedRoomName}
            </span>
          </div>

          <div className="flex flex-col items-end border-r border-white/10 pr-6">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Logged in as</span>
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{myName}</span>
          </div>

          <button 
            onClick={copyRoomLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95"
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

      {/* --- MAIN GRID LAYOUT --- */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 relative z-10 max-w-[1800px] mx-auto w-full md:min-h-0 overflow-hidden">
        
        {/* === LEFT COLUMN === */}
        <div className="flex-[2] lg:flex-[2.5] flex flex-col gap-4 relative md:min-h-0 w-full h-auto md:h-full">
          
          <div className="bg-blue-500/10 border border-blue-500/30 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-start md:items-center gap-3 shrink-0 shadow-inner">
            <ShieldCheck className="text-blue-400 shrink-0 mt-1 md:mt-0" />
            <p className="text-[11px] md:text-xs text-blue-100 font-medium">
              <strong className="text-blue-400 uppercase tracking-widest text-[9px] md:text-[10px] block md:inline mb-1 md:mb-0 md:mr-2">Security Notice:</strong>
              Wait for the host, or click the <strong className="text-blue-400">blue "I am the host" button</strong> inside the video player to unlock the room.
            </p>
          </div>

          {/* Video Container - Notice NO Loading Overlay blocks this anymore! */}
          <div ref={videoWrapperRef} className="w-full relative rounded-xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)] bg-black min-h-[450px] lg:flex-1 lg:min-h-0 group custom-scrollbar">

            <div className="absolute top-4 right-14 z-10 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500">
              <p className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 text-slate-300">
                Drag thumbnail to reposition
              </p>
            </div>

            {/* Fullscreen Button Overlay */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={toggleFullscreen}
                className="bg-black/60 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 backdrop-blur-md p-2 rounded-xl text-slate-300 hover:text-cyan-400 transition-all"
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
            </div>

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
                  className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[90%] max-w-lg"
                >
                  <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/50 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.4)] text-center">
                    <p className="text-[9px] md:text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-2 animate-pulse">Incoming Expert Prompt</p>
                    <h3 className="text-lg md:text-2xl font-bold text-white leading-snug">{activePrompt}</h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Jitsi Iframe Injects Here */}
            <div ref={jitsiContainerRef} className="w-full h-full absolute inset-0" />
          </div>

          {/* COMMAND DECK */}
          <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-3xl p-3 md:p-4 backdrop-blur-md flex items-center justify-between shrink-0 flex-wrap gap-4 overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={toggleMic} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={toggleCam} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isVideoMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {isVideoMuted ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
              <div className="w-px h-6 bg-white/10 mx-1 md:mx-2 hidden md:block" />
              <button onClick={toggleShare} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 text-white border border-transparent hover:border-cyan-500/30 rounded-xl md:rounded-2xl flex items-center justify-center transition-all">
                <MonitorUp size={18} />
              </button>
              <button onClick={toggleHand} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isHandRaised ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <Hand size={18} />
              </button>
              <button onClick={toggleRecord} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <CircleDot size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2 hidden lg:block">Reactions</span>
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