import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Cpu, Activity, Settings, 
  LogOut, ChevronLeft, ChevronRight, 
  Search, ShieldCheck, UploadCloud, FileText,
  Zap, BrainCircuit, CheckCircle2, Sparkles,
  BarChart3, AlertTriangle, User, Target, Mic2, Star, Clock, Network
} from 'lucide-react';
import axios from 'axios';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  
  // --- UI & Navigation States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- Data States ---
  const [user, setUser] = useState({ name: 'Candidate', skills: '', role: 'Candidate' });
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // --- Feature States ---
  const [experts, setExperts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [auditing, setAuditing] = useState(false);

  // Simulated live ping for the new top header UI
  const [ping, setPing] = useState(14);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedName = localStorage.getItem("username") || "Verified Candidate";
    const storedSkills = localStorage.getItem("skills") || "";
    const storedRole = localStorage.getItem("role") || "Candidate";
    
    setUser({ name: storedName, skills: storedSkills, role: storedRole });
    if (storedSkills) setIsVerified(true);

    // Minor ping fluctuation effect for the telemetry UI
    const pingInterval = setInterval(() => {
      setPing(Math.floor(Math.random() * (22 - 12 + 1) + 12));
    }, 3000);
    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    if (user.name !== 'Candidate') {
      fetchUserFiles();
    }
  }, [user.name]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleJoinSync = (targetName) => {
    navigate('/interview', { state: { target: targetName } });
  };

  // --- SECURE FILE VAULT ---
  const fetchUserFiles = async () => {
    try {
      const res = await axios.get(`https://expert-relevance-determination.onrender.com/api/vault/${user.name}`);
      setFiles(res.data.map(f => ({
        name: f.filename,
        size: f.size,
        type: f.filename.split('.').pop().toUpperCase(),
        date: new Date(f.upload_date).toLocaleDateString()
      })));
    } catch (err) {
      console.log("Vault connection pending or empty...");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setUploadStatus('Please select a file.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user.name);

    setIsProcessing(true);
    setUploadStatus('Encrypting & Uploading...');

    try {
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status === "Success") {
        setUploadStatus('Data securely logged in Vault.');
        setFile(null);
        fetchUserFiles(); // Refresh the grid
      }
    } catch (err) {
      setUploadStatus('Upload failed. Check network link.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  // --- AI AUDITOR ---
  const auditProfile = async () => {
    setAuditing(true);
    setAiFeedback("");
    try {
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/audit', { 
        skills: user.skills,
        username: user.name 
      });
      setAiFeedback(res.data.feedback);
    } catch (err) {
      console.error("Auditor sync failed");
    } finally {
      setAuditing(false);
    }
  };

  // --- NEURAL MATCHING (TOP #1 EXPERT ONLY) ---
  const runRelevanceEngine = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/match', {
        skills: user.skills,
        username: user.name
      });
      
      const matchesArray = Array.isArray(res.data) ? res.data : [res.data];
      
      const sortedMatches = matchesArray.sort((a, b) => {
        const scoreA = a.match_score || a.similarity || a.score || 0;
        const scoreB = b.match_score || b.similarity || b.score || 0;
        return scoreB - scoreA;
      });

      if (sortedMatches.length > 0 && sortedMatches[0]) {
        setExperts([sortedMatches[0]]);
      } else {
        setExperts([]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSkillBadges = () => {
    if (!user.skills) return <span className="text-slate-600 italic text-xs font-bold">No skills detected.</span>;
    return user.skills.split(',').map((skill, i) => (
      <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
        {skill.trim()}
      </span>
    ));
  };

  // --- REUSABLE SIDEBAR ITEM ---
  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        activeTab === id 
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }} 
            animate={{ opacity: 1, width: 'auto' }} 
            exit={{ opacity: 0, width: 0 }}
            className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  // --- CUSTOM TOP #1 MATCH PROFILE CARD ---
  const TopMatchProfile = ({ expert }) => {
    const score = typeof expert.similarity === 'number' ? (expert.similarity * 100).toFixed(1) : (expert.match_score || 95.5);
    const expertName = expert.name || expert.username || "Verified Expert";
    const expertDomain = expert.domain || expert.role || "Senior AI/ML Architect";
    
    return (
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-gradient-to-br from-[#041215] to-[#022c22] border border-emerald-500/30 rounded-[3.5rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-emerald-950/50 max-w-4xl mx-auto"
      >
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full" />

        {/* Top Badge */}
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={14} /> Absolute Top Match
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Network size={14} /> Neural Link Ready
          </div>
        </div>

        {/* Main Profile Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          
          {/* Left: Avatar & Score */}
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
              <div className="w-32 h-32 bg-black/60 border-2 border-emerald-500/50 rounded-full flex items-center justify-center relative z-10 shadow-inner">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500">
                  {expertName.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.3em] mb-1">Relevance Score</p>
              <h2 className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                {score}%
              </h2>
            </div>
          </div>

          {/* Right: Details & Action */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">{expertName}</h2>
              <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">{expertDomain}</p>
            </div>

            {/* AI Synergy Analysis */}
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <BrainCircuit size={14} className="text-emerald-400" /> AI Synergy Analysis
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                This expert’s operational parameters strongly align with your Vault data. Their historical evaluation data shows a 
                <span className="text-emerald-400 font-bold"> high correlation </span> 
                with your detected competencies.
              </p>
            </div>

            {/* Micro Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                <Star size={16} className="text-yellow-500" />
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Rating</p>
                  <p className="text-xs font-bold text-white">4.9/5.0</p>
                </div>
              </div>
              <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                <Clock size={16} className="text-blue-400" />
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Avg Response</p>
                  <p className="text-xs font-bold text-white">&lt; 2 Mins</p>
                </div>
              </div>
              <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                <ShieldCheck size={16} className="text-purple-400" />
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Clearance</p>
                  <p className="text-xs font-bold text-white">Level 4</p>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON - ONLY WAY IN! */}
            <button 
              onClick={() => handleJoinSync(expertName)}
              className="w-full py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] active:scale-[0.98]"
            >
              <Mic2 size={18} /> Establish Neural Link
            </button>

          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden selection:bg-blue-500 selection:text-black font-sans">
      
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* --- SIDEBAR --- */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 100 }}
        className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 relative z-20 shrink-0"
      >
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-10 w-8 h-8 bg-blue-500 text-black rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-emerald-600 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
                <h2 className="text-sm font-black tracking-widest uppercase">Nexus Access</h2>
                <p className="text-[9px] text-blue-500 font-bold tracking-[0.2em] uppercase">Candidate Node</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={Activity} label="Overview" id="overview" />
          <SidebarItem icon={Cpu} label="Match Engine" id="match" />
          <SidebarItem icon={FolderOpen} label="Data Vault" id="vault" />
          <SidebarItem icon={BarChart3} label="Performance" id="results" />
        </nav>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group mt-4 shrink-0"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Terminate Link
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
              Identify: {user.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: <span className="text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Connected</span>
            </p>
          </div>
          
          {/* REPLACED BUTTON WITH TELEMETRY WIDGET */}
          <div className="flex items-center gap-6">
            
            {/* Dynamic Telemetry Badge */}
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-2">
                <Network size={14} className="text-emerald-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Latency</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono leading-none">{ping}ms</span>
                </div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Protocol</span>
                  <span className="text-xs font-bold text-white tracking-widest uppercase leading-none">Aegis V2</span>
                </div>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center animate-pulse shrink-0">
              <BrainCircuit className="text-blue-400" size={18} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                
                <div className="lg:col-span-2 space-y-8">
                  {/* Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Matching Status</p>
                      <p className="text-white font-bold text-lg">{experts.length > 0 ? "Sequence Ready" : "Awaiting Sync"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity Score</p>
                      <p className="text-emerald-400 font-bold text-lg">{isVerified ? "Verified (Alpha)" : "Standard"}</p>
                    </div>
                  </div>

                  {/* Profile Identity Card */}
                  <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] shrink-0">
                        <User className="text-blue-400" size={36} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-2">{user.name}</h3>
                        <div className="flex flex-wrap gap-2">{renderSkillBadges()}</div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-400" /> AI Neural Insights
                      </h4>
                      {aiFeedback ? (
                        <p className="text-sm text-blue-100 font-medium leading-relaxed italic p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                          "{aiFeedback}"
                        </p>
                      ) : (
                        <button 
                          onClick={auditProfile} 
                          className="w-full py-5 bg-white/5 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:bg-blue-500/10 transition-all shadow-inner"
                        >
                          {auditing ? "Simulating Logic..." : "Analyze Skill Relevance"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Roadmap Box */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Target size={20} className="text-blue-400" /> Action Roadmap
                    </h3>
                    <div className="space-y-8 relative">
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5" />
                      {[
                        { step: "Node Confirmed", status: "complete" },
                        { step: "Skill Sync", status: "active" },
                        { step: "Expert Match", status: experts.length > 0 ? "complete" : "pending" },
                        { step: "Live Board", status: "pending" }
                      ].map((s, i) => (
                        <div key={i} className="flex gap-4 items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#020617] ${
                            s.status === 'complete' ? 'bg-emerald-500' : s.status === 'active' ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'
                          }`}>
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${s.status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>
                            {s.step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sync Button */}
                  <button 
                    onClick={() => { setActiveTab('match'); runRelevanceEngine(); }}
                    disabled={isProcessing}
                    className="w-full py-6 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-950/40 hover:scale-[1.02] transition-all"
                  >
                    {isProcessing ? "INITIALIZING..." : "Initialize AI Sync"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* MATCH ENGINE TAB */}
            {activeTab === 'match' && (
              <motion.div key="match" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                
                {experts.length > 0 ? (
                  <div className="pt-4">
                     <TopMatchProfile expert={experts[0]} />
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto text-center mt-12">
                    <Cpu size={56} className="text-emerald-400 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-emerald-400 mb-4">Relevance Engine</h2>
                    <p className="text-sm text-slate-400 font-medium max-w-lg mx-auto leading-relaxed mb-12">
                      Initialize the AI Matrix to compare your uploaded Vault data against active Expert requirements. 
                      Only the highest matched expert will be retrieved.
                    </p>
                    
                    <div className="bg-black/40 border border-white/10 p-4 rounded-[3rem] backdrop-blur-md relative overflow-hidden">
                      <button 
                        onClick={runRelevanceEngine} 
                        disabled={isProcessing}
                        className="relative group w-full py-8 rounded-[2.5rem] overflow-hidden border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        <div className="relative flex items-center justify-center gap-4 text-emerald-400 font-black tracking-[0.2em] uppercase text-lg">
                          {isProcessing ? (
                            <span className="animate-pulse flex items-center gap-3">
                              <BrainCircuit className="animate-spin" /> Scanning Expert Nodes...
                            </span>
                          ) : (
                            <><Zap size={24} /> Initiate Scan Sequence</>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* DATA VAULT TAB (Uploads & Files) */}
            {activeTab === 'vault' && (
              <motion.div key="vault" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-blue-400">Secure Data Vault</h2>
                  <p className="text-xs text-slate-400 font-medium mt-2">Upload your resumes and technical documents for AI parsing.</p>
                </div>

                <div className="space-y-8">
                  {/* Upload Form */}
                  <form onSubmit={handleUpload} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-md flex flex-col items-center">
                    <div className="w-full relative group cursor-pointer mb-8">
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative border-2 border-dashed border-blue-500/30 hover:border-blue-400 bg-black/40 rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all">
                        <input 
                          type="file" 
                          onChange={(e) => setFile(e.target.files[0])} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud size={48} className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-slate-300 tracking-widest uppercase text-center">
                          {file ? file.name : "Drag & Drop or Click to Browse"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">PDF, DOCX, TXT</p>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={!file || isProcessing}
                      className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-black text-xs tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                    >
                      {isProcessing ? "TRANSMITTING..." : "UPLOAD TO VAULT"}
                    </button>

                    {uploadStatus && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-xs font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                        <CheckCircle2 size={14} /> {uploadStatus}
                      </motion.p>
                    )}
                  </form>

                  {/* File Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.length > 0 ? files.map((f, i) => (
                      <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-[1.5rem] flex justify-between items-center group hover:bg-white/[0.07] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-black/40 rounded-xl"><FileText className="text-blue-400" size={20} /></div>
                          <div>
                            <p className="text-sm font-bold text-white max-w-[150px] truncate">{f.name}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{f.type} • {f.date}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-lg uppercase tracking-widest">Synced</div>
                      </div>
                    )) : (
                      <div className="md:col-span-2 p-10 border border-dashed border-white/10 rounded-[2rem] text-center text-slate-500 font-bold uppercase text-xs tracking-widest">
                        No files detected in node storage.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'results' && (
               <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[60vh] flex flex-col items-center justify-center text-center">
                 <BarChart3 size={64} className="mx-auto mb-6 text-slate-700 animate-pulse" />
                 <h3 className="text-2xl font-black text-slate-600 uppercase tracking-widest mb-4">Metrics Pending</h3>
                 <button onClick={() => navigate('/result')} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-blue-400 font-black uppercase tracking-widest text-[10px] transition-all">
                   Check Evaluation History
                 </button>
               </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default CandidateDashboard;