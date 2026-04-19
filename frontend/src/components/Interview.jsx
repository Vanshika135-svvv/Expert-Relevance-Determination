import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Activity, BrainCircuit, Radio, Lock, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);

  // --- IDENTITY & HANDSHAKE LOGIC ---
  const myName = localStorage.getItem('username') || 'Unknown Node';
  const myRole = localStorage.getItem('role') || 'Candidate';
  const targetCandidate = location.state?.target;

  // The Room Rule: The room is ALWAYS named after the Candidate.
  // If Candidate logs in -> Room is myName
  // If Expert logs in -> Room is targetCandidate (the person they clicked on)
  const roomBaseName = myRole === 'Expert' ? (targetCandidate || myName) : myName;
  const sanitizedRoomName = `Nexus-SyncRoom-${roomBaseName.replace(/[^a-zA-Z0-9]/g, '')}`;

  const handleDisconnect = () => {
    if (myRole === 'Expert') navigate('/expert-dashboard');
    else navigate('/candidate-dashboard'); // Candidates usually go to result page after
  };

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
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
        userInfo: {
          displayName: myName,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, // Forces Jitsi to skip the lobby screen
          disableModeratorIndicator: true,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'chat', 'tileview', 'hangup'
          ],
        },
      };

      api = new window.JitsiMeetExternalAPI(domain, options);

      // Hide loading screen after 1.5 seconds so user can click browser permissions
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      api.addListener('videoConferenceLeft', () => {
        handleDisconnect();
      });
    };

    initializeJitsi();

    return () => {
      if (api) api.dispose();
    };
  }, [sanitizedRoomName, myName]);

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col font-sans overflow-hidden selection:bg-cyan-500">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <header className="h-20 px-6 md:px-10 border-b border-white/5 bg-white/[0.01] backdrop-blur-xl flex items-center justify-between shrink-0 relative z-20">
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> P2P Encrypted
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

      {/* --- MAIN SPLIT LAYOUT --- */}
      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 relative z-10 overflow-hidden">
        
        {/* Left Side: Jitsi Video Engine (70% width) */}
        <div className="flex-[3] relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)] bg-black/60 backdrop-blur-xl flex flex-col">
          
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
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                  <Activity size={12} className="animate-spin" /> Booting Video Matrix
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>

        {/* Right Side: AI Diagnostics Panel (30% width) */}
        <div className="flex-[1] hidden lg:flex flex-col gap-6">
          
          {/* Identity Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Radio size={14} className="text-blue-400" /> Connection Profile
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Local Node</p>
                <p className="text-sm font-black text-white uppercase tracking-wider">{myName}</p>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">{myRole}</p>
              </div>
              <div className="h-px w-full bg-white/5" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Target Room ID</p>
                <p className="text-xs font-mono text-slate-300 truncate">{sanitizedRoomName}</p>
              </div>
            </div>
          </div>

          {/* Live Telemetry */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md flex-1 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" /> Live Telemetry
            </h3>
            
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Duration</span>
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono">{formatTime(sessionTime)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Encryption</span>
                </div>
                <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md font-black uppercase tracking-widest">Active</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BrainCircuit size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">AI Auditor</span>
                </div>
                <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md font-black uppercase tracking-widest animate-pulse">Monitoring</span>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
              <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-widest text-center">
                All video and audio packets are strictly peer-to-peer encrypted.
              </p>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Interview;