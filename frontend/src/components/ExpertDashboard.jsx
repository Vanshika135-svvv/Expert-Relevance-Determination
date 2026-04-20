import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Calendar, Settings, 
  LogOut, ChevronLeft, ChevronRight, 
  Search, ShieldCheck, Video, CheckCircle2,
  Clock, BrainCircuit, ClipboardCheck, Send
} from 'lucide-react';
import axios from 'axios';

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // --- UI & Navigation States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- Data States ---
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  
  // --- Evaluation Form States ---
  const [evaluation, setEvaluation] = useState({ candidateName: '', score: 5, remarks: '' });
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
  const [evalLoading, setEvalLoading] = useState(false);

  const expertName = localStorage.getItem('username') || 'Verified Expert';

  // --- AUTOMATED ASSESSMENT PRE-FILL LOGIC ---
  useEffect(() => {
    // If the router state contains 'autoOpenAssessment', it means we just left a meeting!
    if (location.state?.autoOpenAssessment) {
      setActiveTab('assessments'); // Auto-switch to the form tab
      
      setEvaluation(prev => ({ 
        ...prev, 
        candidateName: location.state.evaluatedCandidate || "" 
      }));
      
      // CRITICAL: Safely clear the location state so it doesn't get stuck on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch Live Queue Data
  useEffect(() => {
    setTimeout(() => {
      setQueue([
        { id: 1, name: 'Bhaskar Tiwari', domain: 'Machine Learning', matchScore: 94, status: 'Waiting' },
        { id: 2, name: 'Alice Chen', domain: 'Data Engineering', matchScore: 88, status: 'Scheduled' },
        { id: 3, name: 'Rahul Sharma', domain: 'Cloud Architecture', matchScore: 91, status: 'Reviewing' }
      ]);
      setLoadingQueue(false);
    }, 1500);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleJoinSync = (candidateName) => {
    navigate('/interview', { state: { target: candidateName } });
  };

  // --- LIVE BACKEND EVALUATION SUBMISSION ---
  const submitScore = async (e) => {
    if (e) e.preventDefault();

    if (!evaluation.candidateName) {
      setSubmitStatus({ message: 'Candidate name is required.', type: 'error' });
      return;
    }

    setEvalLoading(true);
    setSubmitStatus({ message: '', type: '' });

    try {
      const res = await axios.post('http://localhost:5000/api/assessments', {
        expert_name: expertName,
        candidate_name: evaluation.candidateName,
        score: evaluation.score,
        remarks: evaluation.remarks
      });

      if (res.data.status === "Success" || res.status === 200) {
        setSubmitStatus({ message: 'Evaluation Encrypted & Saved to Database!', type: 'success' });
        setEvaluation({ candidateName: '', score: 5, remarks: '' }); 
        
        setTimeout(() => setSubmitStatus({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error("Failed to log assessment:", err);
      setSubmitStatus({ message: 'Sync Failed: Could not connect to MongoDB.', type: 'error' });
    } finally {
      setEvalLoading(false);
    }
  };

  // --- Reusable Sidebar Item ---
  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        activeTab === id 
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
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

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden selection:bg-cyan-500 selection:text-black font-sans">
      
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* --- SIDEBAR --- */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 100 }}
        className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 relative z-20 shrink-0"
      >
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-10 w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={24} />
            </div>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
                <h2 className="text-sm font-black tracking-widest uppercase">Nexus Command</h2>
                <p className="text-[9px] text-cyan-500 font-bold tracking-[0.2em] uppercase">Expert Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={Activity} label="Command Center" id="overview" />
          <SidebarItem icon={Users} label="Live Queue" id="queue" />
          <SidebarItem icon={ClipboardCheck} label="Assessments" id="assessments" />
          <SidebarItem icon={Calendar} label="Schedule" id="schedule" />
          <SidebarItem icon={Settings} label="System Config" id="settings" />
        </nav>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group mt-4 shrink-0"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden">
                Terminate Session
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
              Welcome, {expertName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Query network..." 
                className="bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-6 text-xs outline-none focus:border-cyan-500/50 w-64 transition-all focus:w-80 font-medium"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-pulse shrink-0">
              <BrainCircuit className="text-cyan-400" size={18} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-6xl mx-auto">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Pending Reviews", value: "14", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Average Match", value: "92%", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { label: "Hours Synced", value: "128", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }
                  ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-[2.5rem] border ${stat.border} ${stat.bg} backdrop-blur-md relative overflow-hidden group hover:-translate-y-1 transition-transform`}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
                      <h3 className={`text-5xl font-black ${stat.color}`}>{stat.value}</h3>
                      <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Activity size={100} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Priority Next Action Box */}
                <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between backdrop-blur-xl gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                      <Clock size={12} /> Priority Queue
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-2">Bhaskar Tiwari is waiting</h2>
                    <p className="text-sm text-cyan-100/70 font-medium">Neural match score: 94% | Domain: AI/ML</p>
                  </div>
                  <button 
                    onClick={() => handleJoinSync("Bhaskar Tiwari")}
                    className="w-full md:w-auto px-8 py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95 shrink-0"
                  >
                    <Video size={18} /> Initialize Sync
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUEUE TAB */}
            {activeTab === 'queue' && (
              <motion.div key="queue" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h2 className="text-xl font-black uppercase tracking-widest text-cyan-400">Live Assessment Queue</h2>
                  <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                    {queue.length} Nodes Active
                  </span>
                </div>

                {loadingQueue ? (
                   <div className="flex justify-center py-20">
                     <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                   </div>
                ) : (
                  <div className="space-y-4">
                    {queue.map((candidate) => (
                      <div key={candidate.id} className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center shadow-inner">
                            <span className="font-black text-xl text-slate-500 group-hover:text-cyan-400 transition-colors">
                              {candidate.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-black tracking-wider uppercase">{candidate.name}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Domain: <span className="text-white">{candidate.domain}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                          <div className="text-left md:text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Match Rate</p>
                            <span className="text-xl font-black text-emerald-400">{candidate.matchScore}%</span>
                          </div>
                          
                          {candidate.status === 'Waiting' ? (
                            <button 
                              onClick={() => handleJoinSync(candidate.name)}
                              className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                              <Video size={14} /> Join Now
                            </button>
                          ) : (
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap">
                              <CheckCircle2 size={14} /> Review Profile
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ASSESSMENTS TAB */}
            {activeTab === 'assessments' && (
              <motion.div key="assessments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-black uppercase tracking-widest text-blue-400">Candidate Evaluation Module</h2>
                  <p className="text-xs text-slate-400 font-medium mt-2">Log final assessment scores securely to the RAC database.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Evaluation Form */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                    <ClipboardCheck className="text-cyan-400 mb-6" size={32} />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6">Log Assessment</h3>
                    
                    <form className="space-y-6" onSubmit={submitScore}>
                      <div>
                        <label className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Candidate Identity</label>
                        <input 
                          type="text"
                          placeholder="e.g. Bhaskar Tiwari"
                          value={evaluation.candidateName}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-cyan-500/50 transition-all"
                          onChange={(e) => setEvaluation({...evaluation, candidateName: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-end mb-2 ml-1">
                          <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Relevance Score</label>
                          <span className="text-3xl font-black text-cyan-400">{evaluation.score}</span>
                        </div>
                        <input 
                          type="range" min="0" max="10" step="0.1"
                          value={evaluation.score}
                          className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none mt-2"
                          onChange={(e) => setEvaluation({...evaluation, score: e.target.value})}
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-black tracking-widest uppercase">
                          <span>0 (Low)</span>
                          <span>10 (High)</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Detailed Remarks</label>
                        <textarea 
                          placeholder="Enter technical feedback or observations..."
                          value={evaluation.remarks}
                          onChange={(e) => setEvaluation({...evaluation, remarks: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-cyan-500/50 transition-all min-h-[100px] resize-y custom-scrollbar"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={evalLoading}
                        className="w-full py-4 mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]"
                      >
                        {evalLoading ? "ENCRYPTING..." : "SUBMIT ANALYSIS"} <Send size={16} />
                      </button>

                      {/* Status Messages */}
                      {submitStatus.message && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`text-center text-xs tracking-widest font-bold mt-4 uppercase ${submitStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {submitStatus.message}
                        </motion.p>
                      )}
                    </form>
                  </div>

                  {/* Guidelines Panel */}
                  <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md h-fit">
                    <ShieldCheck className="text-blue-400 mb-6" size={32} />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6">Assessment Guidelines</h3>
                    
                    <ul className="text-slate-300 space-y-6 text-sm leading-relaxed font-medium">
                      <li className="flex gap-4 items-start">
                        <span className="text-cyan-400 font-black mt-0.5 text-lg">01</span>
                        <span>Assess the candidate's technical alignment with the core requirements of the RAC domain.</span>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-cyan-400 font-black mt-0.5 text-lg">02</span>
                        <span>Score based on demonstrated real-time problem solving and conceptual clarity.</span>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-cyan-400 font-black mt-0.5 text-lg">03</span>
                        <span>All scores <span className="text-emerald-400 font-black">above 8.5</span> require secondary verification and detailed remarks.</span>
                      </li>
                      <li className="flex gap-4 items-start">
                        <span className="text-cyan-400 font-black mt-0.5 text-lg">04</span>
                        <span>Ensure your connection remains stable. All evaluations are instantly encrypted before hitting the database.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PLACEHOLDERS FOR OTHER TABS */}
            {(activeTab === 'schedule' || activeTab === 'settings') && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[50vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <Settings size={48} className="text-slate-700 mb-6 animate-spin-slow" />
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">Module Offline</h2>
                <p className="text-xs text-slate-600 uppercase tracking-widest leading-relaxed">This sector of the expert portal is currently undergoing system calibration.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default ExpertDashboard;