import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  User, Cpu, LogOut, LayoutDashboard, 
  FileText, Mic2, BarChart3, Upload, 
  ChevronRight, CheckCircle2, Zap, Brain,
  Sparkles, Target, AlertTriangle
} from 'lucide-react';

import MatchResultsCard from './MatchResultsCard';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('overview');
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ name: 'Candidate', skills: '' });
  
  // AI Auditor State
  const [isVerified, setIsVerified] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [auditing, setAuditing] = useState(false);
  
  // Vault (File System) State
  const [files, setFiles] = useState([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    const storedSkills = localStorage.getItem("skills");
    if (storedName) {
      setUser({ name: storedName, skills: storedSkills || '' });
      if (storedSkills) setIsVerified(true);
    }
  }, []);

  // Fetch files from backend whenever the username is available
  useEffect(() => {
    if (user.name !== 'Candidate') {
      fetchUserFiles();
    }
  }, [user.name]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- FEATURE: SECURE FILE VAULT (THE HANDSHAKE) ---
  
  // 1. Fetch files from MongoDB
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
      console.log("Vault connection pending...");
    }
  };

  // 2. Upload file using FormData API
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user.name);

    setLoading(true);
    try {
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === "Success") {
        fetchUserFiles(); // Refresh list immediately
      }
    } catch (err) {
      alert("Neural upload interrupted. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- FEATURE: AI AUDITOR ---
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

  // --- FEATURE: NEURAL MATCHING ---
  const runMatching = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/match', {
        skills: user.skills,
        username: user.name
      });
      setExperts(res.data);
      setActiveTab('match'); 
    } catch (err) {
      console.error("Match sequence failed");
    } finally {
      setLoading(false);
    }
  };

  const renderSkillBadges = () => {
    if (!user.skills) return <span className="text-slate-600 italic text-xs">No skills detected.</span>;
    return user.skills.split(',').map((skill, i) => (
      <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
        {skill.trim()}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex overflow-hidden selection:bg-cyan-500">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-white/5 border-r border-white/10 backdrop-blur-2xl flex flex-col p-6 relative z-30">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
            <Brain className="text-cyan-400" size={24} />
          </div>
          <span className="font-black tracking-tighter text-xl text-white uppercase">NEXUS RAC</span>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'match', label: 'Neural Match', icon: Cpu },
            { id: 'vault', label: 'The Vault', icon: FileText },
            { id: 'results', label: 'Performance', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors mt-auto">
          <LogOut size={18} /> DISCONNECT
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow overflow-y-auto p-10 relative">
        <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-cyan-500/5 blur-[120px] -z-10" />

        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Candidate Portal</h2>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Node Active: {user.name}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/interview')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
          >
            <Mic2 size={16} /> Join Live Board
          </button>
        </header>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW & AUDITOR */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Matching Status</p>
                     <p className="text-white font-bold text-lg">{experts.length > 0 ? "Sequence Ready" : "Awaiting Sync"}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity Score</p>
                     <p className="text-emerald-400 font-bold text-lg">{isVerified ? "Verified (Alpha)" : "Standard"}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-cyan-500/20 rounded-3xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      <User className="text-cyan-400" size={36} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                       <div className="flex flex-wrap gap-2">{renderSkillBadges()}</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={14} className="text-cyan-400" /> AI Neural Insights
                    </h4>
                    {aiFeedback ? (
                      <p className="text-sm text-cyan-100 leading-relaxed italic p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                         "{aiFeedback}"
                      </p>
                    ) : (
                      <button 
                        onClick={auditProfile} 
                        className="w-full py-4 bg-white/5 border border-cyan-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:bg-cyan-500/5 transition-all"
                      >
                        {auditing ? "Simulating Logic..." : "Analyze Skill Relevance"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Target size={20} className="text-blue-400" /> Roadmap</h3>
                    <div className="space-y-8 relative">
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5" />
                      {[
                        { step: "Node Confirmed", status: "complete" },
                        { step: "Skill Sync", status: "active" },
                        { step: "Expert Match", status: "pending" },
                        { step: "Live Board", status: "pending" }
                      ].map((s, i) => (
                        <div key={i} className="flex gap-4 items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#020617] ${
                            s.status === 'complete' ? 'bg-emerald-500' : s.status === 'active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-800'
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

                 <button 
                    onClick={runMatching}
                    disabled={loading}
                    className="w-full py-6 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-cyan-950/40 hover:scale-[1.02] transition-all"
                  >
                    {loading ? "INITIALIZING..." : "Initialize AI Sync"}
                 </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: NEURAL MATCH RESULTS */}
          {activeTab === 'match' && (
             <motion.div key="match" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                {experts.length > 0 ? (
                   <MatchResultsCard experts={experts} />
                ) : (
                   <div className="p-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                      <AlertTriangle size={48} className="text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active matches. Start AI Sync on Dashboard.</p>
                   </div>
                )}
             </motion.div>
          )}

          {/* TAB 3: THE VAULT (MULTI-FILE UPLOAD) */}
          {activeTab === 'vault' && (
            <motion.div key="vault" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center backdrop-blur-md">
                {/* Hidden File Input */}
                <input type="file" id="file-vault" className="hidden" onChange={handleFileUpload} />
                
                <label htmlFor="file-vault" className="cursor-pointer group block">
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover:border-cyan-500/50 transition-all shadow-inner">
                    <Upload className="text-cyan-400" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Technical Repository</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed italic">
                    Upload Resumes (PDF), Matrices (Excel), or Code Samples for Expert review.
                  </p>
                </label>
              </div>

              {/* Dynamic File Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.length > 0 ? files.map((file, i) => (
                  <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-black/40 rounded-xl"><FileText className="text-blue-400" size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-white max-w-[150px] truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{file.type} • {file.size} • {file.date}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded-lg uppercase">Synced</div>
                  </div>
                )) : (
                  <div className="md:col-span-2 p-10 border border-dashed border-white/5 rounded-2xl text-center text-slate-600 font-bold uppercase text-xs tracking-widest">
                    No files detected in node storage.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: PERFORMANCE */}
          {activeTab === 'results' && (
             <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-32 text-center">
                <BarChart3 size={64} className="mx-auto mb-6 text-slate-800" />
                <h3 className="text-2xl font-bold text-slate-600 uppercase tracking-tighter">Metrics Pending</h3>
                <button onClick={() => navigate('/result')} className="mt-4 text-cyan-400 font-bold uppercase tracking-widest text-xs hover:underline">
                  Check Evaluation History
                </button>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CandidateDashboard;