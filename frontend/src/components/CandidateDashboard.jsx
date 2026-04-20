import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Cpu, Activity, Settings, 
  LogOut, ChevronLeft, ChevronRight, 
  Search, ShieldCheck, UploadCloud, FileText,
  Zap, BrainCircuit, CheckCircle2, Sparkles,
  BarChart3, AlertTriangle, User, Target, Mic2, Star, Clock, Network, ArrowRight, Play, Database,
  Eye, Trash2, Bell
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

  // --- Resume Upload & Display States ---
  const [resumes, setResumes] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploadStatus, setResumeUploadStatus] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  // --- Feature States ---
  const [matches, setMatches] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [auditing, setAuditing] = useState(false);
  const [matchError, setMatchError] = useState("");

  // --- NOTIFICATION STATES ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [ping, setPing] = useState(14);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedName = localStorage.getItem("username") || "Verified Candidate";
    const storedSkills = localStorage.getItem("skills") || "";
    const storedRole = localStorage.getItem("role") || "Candidate";
    
    setUser({ name: storedName, skills: storedSkills, role: storedRole });
    if (storedSkills) setIsVerified(true);

    const pingInterval = setInterval(() => setPing(Math.floor(Math.random() * (22 - 12 + 1) + 12)), 3000);
    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    if (user.name !== 'Candidate') {
      fetchUserFiles();
      fetchUserResumes();
      fetchNotifications();
      
      // Auto-poll notifications every 10 seconds
      const notifInterval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(notifInterval);
    }
  }, [user.name]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleJoinSync = (expertName) => {
    navigate('/interview', { state: { target: expertName } });
  };

  // --- NOTIFICATION LOGIC ---
  const fetchNotifications = async () => {
    try {
      // URL encoded to prevent errors with spaces in names (e.g. "Bhaskar Tiwari")
      const res = await axios.get(`http://localhost:5000/api/notifications/${encodeURIComponent(user.name)}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${id}`);
      fetchNotifications(); // Refresh list to remove the red dot
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- SECURE RESUME VAULT LOGIC ---
  const fetchUserResumes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/resumes/${user.name}`);
      setResumes(res.data.map(r => ({
        id: r.gridfs_id, 
        name: r.filename || "Unknown Document",
        size: r.size || "N/A",
        date: r.upload_date ? new Date(r.upload_date).toLocaleDateString() : "Unknown Date",
        isLegacy: r.gridfs_id === r._id 
      })));
    } catch (err) {
      console.log("Resume fetch error or empty.");
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return setResumeUploadStatus('Please select a file.');

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('username', user.name);

    setIsUploadingResume(true);
    setResumeUploadStatus('Encrypting & Uploading...');

    try {
      const res = await axios.post('http://localhost:5000/api/upload_resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status === "Success") {
        setResumeUploadStatus('Resume successfully synced to Neural Core.');
        setResumeFile(null);
        fetchUserResumes();
      }
    } catch (err) {
      setResumeUploadStatus('Upload failed. Check network link.');
    } finally {
      setIsUploadingResume(false);
      setTimeout(() => setResumeUploadStatus(''), 4000);
    }
  };

  const handleDeleteResume = async (fileId) => {
    if (!window.confirm("Delete this resume permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resumes/delete/${fileId}`);
      fetchUserResumes();
    } catch (err) {
      console.error("Failed to delete resume", err);
      alert("Error: Could not delete resume from database.");
    }
  };

  // --- SECURE GENERAL VAULT LOGIC ---
  const fetchUserFiles = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vault/${user.name}`);
      setFiles(res.data.map(f => ({
        id: f.gridfs_id, 
        name: f.filename || "Unknown Document",
        size: f.size || "N/A", 
        type: (f.filename || "FILE").split('.').pop().toUpperCase(),
        date: f.upload_date ? new Date(f.upload_date).toLocaleDateString() : "Unknown Date",
        isLegacy: f.gridfs_id === f._id 
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
      const res = await axios.post('http://localhost:5000/api/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      if (res.data.status === "Success") {
        setUploadStatus('Data securely logged in Vault.');
        setFile(null);
        fetchUserFiles();
      }
    } catch (err) { 
      setUploadStatus('Upload failed. Check network link.');
    } finally { 
      setIsProcessing(false); 
      setTimeout(() => setUploadStatus(''), 3000); 
    }
  };

  const handleViewFile = (fileId, isLegacy) => {
    if (isLegacy) {
      alert("This is a legacy file from an older version of the vault and cannot be viewed. Please delete it and re-upload.");
      return;
    }
    window.open(`http://localhost:5000/api/vault/view/${fileId}`, '_blank');
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to permanently delete this file from the Vault?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/vault/delete/${fileId}`);
      fetchUserFiles();
    } catch (err) { 
      alert("Error: Could not delete file from database."); 
    }
  };

  const auditProfile = async () => {
    setAuditing(true); 
    setAiFeedback("");
    try {
      const res = await axios.post('http://localhost:5000/api/audit', { 
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

  const runMatchEngine = async () => {
    setIsProcessing(true); 
    setMatchError(""); 
    setMatches([]);

    try {
      const res = await axios.post('http://localhost:5000/api/match', { 
        username: user.name, 
        skills: user.skills 
      });

      if (res.data && res.data.length > 0) {
        const formattedMatches = res.data.slice(0, 3).map(match => ({
           id: match.id || Math.random(), 
           expert_name: match.expert_name || match.name || "Verified Expert",
           domain: match.domain || "Specialist", 
           score: typeof match.score === 'number' ? match.score.toFixed(1) : (match.match_score || 90.0)
        }));
        
        setMatches(formattedMatches.sort((a, b) => b.score - a.score));
      } else {
        setMatchError("No suitable experts found in the database. Please update your Vault skills.");
      }
    } catch (err) { 
      console.error("Matching Error:", err);
      setMatchError("Failed to connect to the Neural Match Engine.");
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

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        activeTab === id 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
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

  const TopMatchProfile = ({ expert }) => {
    const expertName = expert.expert_name;
    const expertDomain = expert.domain;
    const score = expert.score;
    
    return (
      <div className="bg-gradient-to-br from-emerald-950/40 to-[#020617] border border-emerald-500/20 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl mb-6">
        <div className="absolute -right-10 -bottom-10 opacity-5"><BrainCircuit size={200} /></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-emerald-500/20">
            <Sparkles size={12}/> Absolute Top Match
          </span>
          <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">
            <Network size={12}/> Neural Link Ready
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
              <div className="w-28 h-28 bg-black/60 border-[6px] border-emerald-500/20 border-t-emerald-400 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500">
                  {expertName.charAt(0)}
                </span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4 mb-1">Relevance Score</p>
            <h2 className="text-4xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">{score}%</h2>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-1">{expertName}</h2>
            <p className="text-sm text-cyan-400 font-bold uppercase tracking-widest mb-6">{expertDomain} Expert</p>
            
            <div className="bg-black/40 border border-white/5 p-5 rounded-2xl mb-6 text-left backdrop-blur-md">
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><BrainCircuit size={12}/> AI Synergy Analysis</p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">This expert's operational parameters strongly align with your Vault data. Their historical evaluation data shows a <span className="text-emerald-400 font-bold">high correlation</span> with your detected competencies.</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 justify-center md:justify-start">
              <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                <Star size={16} className="text-yellow-500" />
                <div className="text-left">
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Rating</p>
                  <p className="text-xs font-bold text-white">4.9/5.0</p>
                </div>
              </div>
              <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                <Clock size={16} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Avg Response</p>
                  <p className="text-xs font-bold text-white">&lt; 2 Mins</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleJoinSync(expertName)} 
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
               <Mic2 size={16} /> Establish Neural Link
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden selection:bg-blue-500 selection:text-black font-sans">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 p-0.5 shrink-0">
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
          <SidebarItem icon={BrainCircuit} label="Match Engine" id="match" />
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
        {/* ADDED 'relative z-50' to header to fix Notification Dropdown clipping! */}
        <header className="relative z-50 h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-3">
              Identify: <span className="text-white">{user.name}</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: <span className="text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Connected</span>
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            
            {/* NOTIFICATION BELL WIDGET */}
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10">
                <Bell size={18} className="text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div initial={{opacity:0, y:10, scale:0.95}} animate={{opacity:1,y:0, scale:1}} exit={{opacity:0,y:10, scale:0.95}} className="absolute right-0 mt-4 w-80 bg-[#0B1021]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">System Alerts</h3>
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">{unreadCount} New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No alerts detected.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => markNotificationRead(n._id)} className={`p-4 rounded-xl cursor-pointer transition-all ${n.read ? 'bg-transparent opacity-60 hover:bg-white/5' : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'}`}>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex justify-between">
                              {n.sender} <span className="text-slate-500">{new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </p>
                            <p className="text-sm font-medium text-slate-200 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-full px-6 py-2">
              <div className="flex flex-col border-r border-white/10 pr-4">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Latency</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Network size={12}/> {ping}ms</span>
              </div>
              <div className="flex flex-col pl-2">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Protocol</span>
                <span className="text-xs text-white font-bold flex items-center gap-1"><ShieldCheck size={12}/> AEGIS V2</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
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
                      <p className="text-white font-bold text-lg">{matches.length > 0 ? "Sequence Ready" : "Awaiting Sync"}</p>
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

                    {/* DYNAMIC RESUME DISPLAY & UPLOAD */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <UploadCloud size={14} className="text-emerald-400" /> Primary Resume Sync
                      </h4>

                      {/* Render Fetched Resumes */}
                      {resumes.length > 0 && (
                        <div className="mb-6 space-y-3">
                          
                          {/* 1. MOST RECENT RESUME (Highlighted) */}
                          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <div className="flex items-center gap-3 overflow-hidden pr-2">
                              <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
                                <FileText className="text-emerald-400" size={20} />
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-bold text-emerald-400 truncate">{resumes[0].name}</p>
                                <p className="text-[9px] text-emerald-500/70 font-black uppercase tracking-widest mt-0.5">Active Primary Node • {resumes[0].date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleViewFile(resumes[0].id, resumes[0].isLegacy)} className="p-2 bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-400 rounded-lg transition-all" title="View Secure File"><Eye size={14} /></button>
                              <button onClick={() => handleDeleteResume(resumes[0].id)} className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition-all" title="Delete Resume"><Trash2 size={14} /></button>
                            </div>
                          </div>

                          {/* 2. PREVIOUS RESUMES (List) */}
                          {resumes.length > 1 && (
                            <div className="pl-4 space-y-2 border-l-2 border-white/5 mt-4">
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Archived Versions</p>
                              {resumes.slice(1).map(r => (
                                <div key={r.id} className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-white/5 group">
                                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                                    <FileText size={12} className="text-slate-500 shrink-0"/>
                                    <p className="text-xs text-slate-400 truncate">{r.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleViewFile(r.id, r.isLegacy)} className="text-slate-500 hover:text-emerald-400 transition-colors"><Eye size={12} /></button>
                                    <button onClick={() => handleDeleteResume(r.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload Input */}
                      <form onSubmit={handleResumeUpload} className="flex flex-col gap-3">
                        <div className="relative group cursor-pointer">
                          <div className="absolute inset-0 bg-emerald-500/10 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative border border-dashed border-emerald-500/30 hover:border-emerald-400 bg-black/40 rounded-xl p-4 flex flex-col items-center justify-center transition-all">
                            <input
                              type="file"
                              onChange={(e) => setResumeFile(e.target.files[0])}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept=".pdf,.docx,.doc"
                            />
                            <p className="text-xs font-bold text-slate-300 tracking-widest uppercase text-center">
                              {resumeFile ? resumeFile.name : "Select Resume File (PDF/DOCX)"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={!resumeFile || isUploadingResume}
                          className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black disabled:opacity-50 text-emerald-400 font-black text-[10px] tracking-[0.2em] uppercase rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          {isUploadingResume ? "SYNCING..." : "UPLOAD NEW RESUME"}
                        </button>
                        {resumeUploadStatus && (
                          <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase text-center mt-2">
                            {resumeUploadStatus}
                          </p>
                        )}
                      </form>
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
                        { step: "Expert Match", status: matches.length > 0 ? "complete" : "pending" },
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
                    onClick={() => { setActiveTab('match'); runMatchEngine(); }}
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
              <motion.div key="match" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto space-y-8">
                
                {/* Trigger Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-white">Neural Match Engine</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Scan the database to find experts mathematically aligned with your Vault data.</p>
                  </div>
                  <button 
                    onClick={runMatchEngine}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95 whitespace-nowrap"
                  >
                    {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={16} />}
                    {isProcessing ? "Calculating Vectors..." : "Run AI Sequence"}
                  </button>
                </div>

                {/* Error State */}
                {matchError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold text-center rounded-2xl">
                    {matchError}
                  </div>
                )}

                {/* Match Results Matrix */}
                {matches.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    
                    {/* #1 ABSOLUTE TOP MATCH */}
                    <TopMatchProfile expert={matches[0]} />

                    {/* #2 & #3 SECONDARY MATCHES */}
                    {matches.length > 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matches.slice(1, 3).map((match, i) => (
                          <div key={match.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md flex flex-col hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between mb-6">
                              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 flex items-center gap-1">
                                <Zap size={10} /> Highly Relevant
                              </span>
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Match #{i + 2}</span>
                            </div>
                            
                            <div className="flex items-center gap-5 mb-6">
                              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-400 flex items-center justify-center bg-black/40 shrink-0">
                                <span className="text-xl font-black text-blue-400">{match.expert_name.charAt(0)}</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-black uppercase tracking-wider text-white truncate">{match.expert_name}</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">{match.domain}</p>
                              </div>
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                              <div>
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Score</p>
                                <p className="text-xl font-black text-blue-400">{match.score}%</p>
                              </div>
                              <button 
                                onClick={() => handleJoinSync(match.expert_name)} 
                                className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                              >
                                Connect <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // Default Empty State for Match Engine
                  <div className="max-w-4xl mx-auto text-center mt-12">
                    <Cpu size={56} className="text-blue-400 mx-auto mb-6 opacity-50" />
                    <h2 className="text-3xl font-black uppercase tracking-widest text-slate-500 mb-4">Neural Match Engine</h2>
                    <p className="text-sm text-slate-400 font-medium max-w-lg mx-auto leading-relaxed mb-12">
                      Initialize the AI Matrix to compare your uploaded Vault data against active Expert requirements. 
                      Click the "Run AI Sequence" button above to begin.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* DATA VAULT TAB (Uploads & Files) */}
            {activeTab === 'vault' && (
              <motion.div key="vault" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-blue-400">Secure Data Vault</h2>
                  <p className="text-xs text-slate-400 font-medium mt-2">Upload your general technical documents for AI parsing.</p>
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
                        <div className="flex items-center gap-4 min-w-0 pr-4">
                          <div className="p-3 bg-black/40 rounded-xl shrink-0"><FileText className="text-blue-400" size={20} /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate w-32 md:w-40">{f.name}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{f.type} • {f.date}</p>
                          </div>
                        </div>
                        
                        {/* VIEW & DELETE ACTION BUTTONS */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => handleViewFile(f.id, f.isLegacy)} 
                            className="p-2.5 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 rounded-xl transition-all" 
                            title="View Secure File"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFile(f.id)} 
                            className="p-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-xl transition-all" 
                            title="Delete Permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                 <h3 className="text-2xl font-black text-slate-600 uppercase tracking-widest mb-4">Evaluation Data Ready</h3>
                 <button onClick={() => navigate('/result')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] transition-all">
                   View Official Transcript
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