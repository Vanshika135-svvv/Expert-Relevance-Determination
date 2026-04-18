import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jitsiContainerRef = useRef(null);
  
  // Start with loading screen ON
  const [isLoading, setIsLoading] = useState(true);

  // Identify who is entering the room
  const myName = localStorage.getItem('username') || 'Unknown Node';
  const myRole = localStorage.getItem('role') || 'Candidate';

  // --- ROOM HANDSHAKE LOGIC ---
  const targetCandidate = location.state?.target;
  const roomBaseName = targetCandidate ? targetCandidate : myName;

  // Ensure room name is URL-safe for Jitsi
  const sanitizedRoomName = `Nexus-SyncRoom-${roomBaseName.replace(/[^a-zA-Z0-9]/g, '')}`;

  const handleDisconnect = () => {
    if (myRole === 'Expert') {
      navigate('/expert-dashboard');
    } else {
      navigate('/result');
    }
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
          prejoinPageEnabled: false, 
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_JITSI_WATERMARK: false,
        },
      };

      api = new window.JitsiMeetExternalAPI(domain, options);

      // FIX: Remove loading screen IMMEDIATELY so the user can click the camera permission prompt!
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);

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
      
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Top Navigation Bar */}
      <header className="h-24 px-6 md:px-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl flex items-center justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Live Neural Sync
            </h1>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Secure P2P Connection
            </p>
          </div>
        </div>

        <button 
          onClick={handleDisconnect}
          className="flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/30 text-red-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
        >
          <ArrowLeft size={16} /> Terminate Session
        </button>
      </header>

      {/* Video Room Container */}
      <main className="flex-1 p-6 md:p-10 relative flex flex-col">
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-md rounded-[2.5rem] m-6 md:m-10"
            >
              <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <BrainCircuit size={48} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-cyan-400 mb-2">Establishing Link...</h2>
              <p className="text-xs text-slate-400 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <Activity size={14} className="animate-spin" /> Booting Video Matrix
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Native Jitsi Container */}
        <div 
          className="flex-1 w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative z-0 bg-black/60 backdrop-blur-xl"
        >
          {/* Jitsi automatically injects its iframe into this div */}
          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
      </main>

    </div>
  );
};

export default Interview;