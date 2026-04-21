import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Calendar, Settings, 
  LogOut, ChevronLeft, ChevronRight, 
  Search, ShieldCheck, Video, CheckCircle2,
  Clock, BrainCircuit, ClipboardCheck, Send, Bell, FileText, Eye
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

  // --- NOTIFICATION & SCHEDULING STATES ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [expertSchedules, setExpertSchedules] = useState([]);

  const expertName = localStorage.getItem('username') || 'Verified Expert';

  // --- AUTOMATED ASSESSMENT PRE-FILL LOGIC ---
  useEffect(() => {
    if (location.state?.autoOpenAssessment) {
      setActiveTab('assessments'); 
      setEvaluation(prev => ({ 
        ...prev, 
        candidateName: location.state.evaluatedCandidate || "" 
      }));
      // Safely clear the location state so it doesn't get stuck on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // --- INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    const fetchQueue = async () => {
      // Simulated Queue Data
      const baseQueue = [
        { id: 1, name: 'Bhaskar Tiwari', domain: 'Machine Learning', matchScore: 94, status: 'Waiting' },
        { id: 2, name: 'Alice Chen', domain: 'Data Engineering', matchScore: 88, status: 'Scheduled' },
        { id: 3, name: 'Rahul Sharma', domain: 'Cloud Architecture', matchScore: 91, status: 'Reviewing' }
      ];

      // Dynamically check each candidate for a resume in the GridFS database
      const queueWithResumes = await Promise.all(baseQueue.map(async (candidate) => {
        try {
          const res = await axios.get(`http://localhost:5000/api/expert/get_resume/${encodeURIComponent(candidate.name)}`);
          return { ...candidate, resumeId: res.data.gridfs_id };
        } catch {
          return { ...candidate, resumeId: null };
        }
      }));

      setQueue(queueWithResumes);
      setLoadingQueue(false);
    };

    fetchQueue();
    fetchNotifications();
    fetchExpertSchedules();
    
    // Auto-poll matrix every 10 seconds
    const notifInterval = setInterval(() => {
      fetchNotifications();
      fetchExpertSchedules();
    }, 10000);
    return () => clearInterval(notifInterval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleViewResume = (fileId) => {
    window.open(`http://localhost:5000/api/vault/view/${fileId}`, '_blank');
  };

  // --- SCHEDULING LOGIC ---
  const fetchExpertSchedules = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/schedules/${encodeURIComponent(expertName)}`);
      setExpertSchedules(res.data);
    } catch (err) {
      console.error("Failed to fetch schedules");
    }
  };

  const handleScheduleResponse = async (id, dateTime, status) => {
    if (status === 'Pending' && !dateTime) return alert("Please select a time for your counter-proposal.");
    try {
      await axios.post('http://localhost:5000/api/schedules', {
        id, dateTime, status, sender: expertName
      });
      alert(`Slot ${status}`);
      fetchExpertSchedules();
    } catch (err) {
      console.error("Schedule sync failed");
    }
  };

  // --- SYNC ACTIONS & NOTIFICATIONS ---
  const handleJoinSync = async (candidateName) => {
    try {
      await axios.post('http://localhost:5000/api/notifications', {
        recipient: candidateName,
        sender: expertName,
        message: `${expertName} has initialized the Neural Sync room. Establish connection immediately.`,
        type: "alert"
      });
    } catch (err) {
      console.error("Failed to ping candidate.");
    }
    
    navigate('/interview', { state: { target: candidateName } });
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${encodeURIComponent(expertName)}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch system notifications");
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  const submitScore = async (e) => {
    if (e) e.preventDefault();
    if (!evaluation.candidateName) {
      setSubmitStatus({ message: 'Candidate identity required.', type: 'error' });
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
        setSubmitStatus({ message: 'Analysis logged to MongoDB successfully.', type: 'success' });
        setEvaluation({ candidateName: '', score: 5, remarks: '' }); 
        setTimeout(() => setSubmitStatus({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      setSubmitStatus({ message: 'Database Sync Failed.', type: 'error' });
    } finally {
      setEvalLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden">
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
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-4 top-10 w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center"><ShieldCheck className="text-cyan-400" size={24} /></div>
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
          <SidebarItem icon={Calendar} label="Schedule" id="schedule" />
          <SidebarItem icon={ClipboardCheck} label="Assessments" id="assessments" />
          <SidebarItem icon={Settings} label="System Config" id="settings" />
        </nav>

        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group mt-4 shrink-0">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence>
            {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden">Terminate Session</motion.span>}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Topbar: RELATIVE Z-50 Fix applied here */}
        <header className="relative z-50 h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Welcome, {expertName}</h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* NOTIFICATION WIDGET */}
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group">
                <Bell size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#020617] animate-pulse flex items-center justify-center text-[7px] font-bold text-white">{unreadCount}</span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div initial={{opacity:0, y:10, scale:0.95}} animate={{opacity:1,y:0, scale:1}} exit={{opacity:0,y:10, scale:0.95}} className="absolute right-0 mt-4 w-80 bg-[#0B1021]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Neural matrix Alerts</h3>
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold">{unreadCount} New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">No signals detected.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => markNotificationRead(n._id)} className={`p-4 rounded-xl cursor-pointer transition-all ${n.read ? 'bg-transparent opacity-50 hover:bg-white/5' : 'bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20'}`}>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex justify-between">
                              {n.sender} <span className="text-slate-600 font-mono">{new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </p>
                            <p className="text-xs font-medium text-slate-200 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Query network..." className="bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-6 text-xs outline-none focus:border-cyan-500/50 w-64 transition-all focus:w-80 font-medium" />
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-pulse shrink-0"><BrainCircuit className="text-cyan-400" size={18} /></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* --- OVERVIEW --- */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[{ label: "Pending Reviews", val: "14", col: "text-blue-400" }, { label: "Average Match", val: "92%", col: "text-emerald-400" }, { label: "Hours Synced", val: "128", col: "text-purple-400" }].map((s, i) => (
                    <div key={i} className="p-6 rounded-[2.5rem] border border-white/10 bg-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{s.label}</p>
                      <h3 className={`text-5xl font-black ${s.col}`}>{s.val}</h3>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-2xl gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4"><Clock size={12} /> Priority Node</div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest">Bhaskar Tiwari is waiting</h2>
                    <p className="text-sm text-cyan-100/70 font-medium">Neural match score: 94% | Domain: AI/ML</p>
                  </div>
                  <button onClick={() => handleJoinSync("Bhaskar Tiwari")} className="w-full md:w-auto px-8 py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    <Video size={18} /> Initialize Sync
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- LIVE QUEUE --- */}
            {activeTab === 'queue' && (
              <motion.div key="queue" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-6xl mx-auto space-y-4">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black uppercase tracking-widest text-cyan-400">Assessment Stream</h2>
                  <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{queue.length} Nodes Active</span>
                </div>
                {loadingQueue ? (
                  <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" /></div>
                ) : (
                  queue.map((candidate) => (
                    <div key={candidate.id} className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xl text-slate-500 group-hover:text-cyan-400 transition-colors">{candidate.name.charAt(0)}</div>
                        <div>
                          <h3 className="text-lg font-black tracking-wider uppercase text-white">{candidate.name}</h3>
                          <p className="text-xs text-slate-400 uppercase font-bold mt-1">Expert Domain: {candidate.domain}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto">
                        {candidate.resumeId ? (
                          <button onClick={() => handleViewResume(candidate.resumeId)} className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            <FileText size={14} /> View Resume
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic px-2">No Resume Node</span>
                        )}
                        <div className="text-center min-w-[80px]">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Match</p>
                          <span className="text-xl font-black text-emerald-400">{candidate.matchScore}%</span>
                        </div>
                        <button onClick={() => handleJoinSync(candidate.name)} className="px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 shadow-lg"><Video size={14} /> Join Now</button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* --- AVAILABILITY / SCHEDULE MANAGER --- */}
            {activeTab === 'schedule' && (
              <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-xl font-black uppercase text-cyan-400">Node Availability Manager</h2>
                <div className="space-y-4">
                  {expertSchedules.length === 0 ? (
                    <div className="text-center p-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-slate-600 font-black uppercase text-xs tracking-widest">No active slot requests.</div>
                  ) : expertSchedules.map(s => (
                    <div key={s._id} className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-500">{s.candidate.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-white uppercase tracking-wider">{s.candidate}</p>
                          <p className="text-[10px] text-cyan-400 font-mono mt-1 bg-cyan-500/10 px-2 py-0.5 rounded uppercase font-bold w-fit">{new Date(s.dateTime).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.status === 'Pending' ? (
                          <>
                            <button onClick={() => handleScheduleResponse(s._id, s.dateTime, 'Confirmed')} className="px-6 py-3 bg-emerald-500 text-black font-black text-[10px] uppercase rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">Accept Slot</button>
                            <input type="datetime-local" className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-cyan-500" onChange={(e) => s.newTime = e.target.value} />
                            <button onClick={() => handleScheduleResponse(s._id, s.newTime, 'Pending')} className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-[10px] uppercase rounded-xl hover:bg-cyan-500 hover:text-black transition-all">Counter</button>
                          </>
                        ) : (
                          <span className="text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30 px-6 py-3 rounded-xl bg-emerald-500/5 flex items-center gap-2"><CheckCircle2 size={14} /> Sync Confirmed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- ASSESSMENTS --- */}
            {activeTab === 'assessments' && (
              <motion.div key="assessments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-black uppercase tracking-widest text-blue-400">Candidate Evaluation Module</h2>
                  <p className="text-xs text-slate-400 font-medium mt-2">Log final assessment scores securely to the RAC database.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl">
                    <ClipboardCheck className="text-cyan-400 mb-6" size={32} />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6 text-white">Log Assessment</h3>
                    <form className="space-y-6" onSubmit={submitScore}>
                      <div>
                        <label className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Candidate Identity</label>
                        <input type="text" placeholder="e.g. Bhaskar Tiwari" value={evaluation.candidateName} onChange={e=>setEvaluation({...evaluation, candidateName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-cyan-500/50 transition-all text-white" />
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-2 ml-1">
                          <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Relevance Score</label>
                          <span className="text-3xl font-black text-cyan-400">{evaluation.score}</span>
                        </div>
                        <input type="range" min="0" max="10" step="0.1" value={evaluation.score} onChange={e=>setEvaluation({...evaluation, score: e.target.value})} className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none mt-2" />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-black tracking-widest uppercase"><span>0 (Low)</span><span>10 (High)</span></div>
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] font-black mb-2 uppercase tracking-widest ml-1">Detailed Remarks</label>
                        <textarea placeholder="Enter technical feedback..." value={evaluation.remarks} onChange={e=>setEvaluation({...evaluation, remarks: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-cyan-500/50 transition-all min-h-[100px] resize-y custom-scrollbar text-white shadow-inner" />
                      </div>
                      <button type="submit" disabled={evalLoading} className="w-full py-4 mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98]">{evalLoading ? "ENCRYPTING..." : "SUBMIT ANALYSIS"} <Send size={16} /></button>
                      {submitStatus.message && ( <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center text-xs tracking-widest font-bold mt-4 uppercase ${submitStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{submitStatus.message}</motion.p> )}
                    </form>
                  </div>

                  <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md h-fit">
                    <ShieldCheck className="text-blue-400 mb-6" size={32} />
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6">Assessment Guidelines</h3>
                    <ul className="text-slate-300 space-y-6 text-sm leading-relaxed font-medium">
                      <li className="flex gap-4 items-start"><span className="text-cyan-400 font-black mt-0.5 text-lg">01</span><span>Assess alignment with RAC technical requirements.</span></li>
                      <li className="flex gap-4 items-start"><span className="text-cyan-400 font-black mt-0.5 text-lg">02</span><span>Score based on demonstrated conceptual clarity.</span></li>
                      <li className="flex gap-4 items-start"><span className="text-cyan-400 font-black mt-0.5 text-lg">03</span><span>All scores above 8.5 require secondary verification.</span></li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SETTINGS / OFFLINE TABS */}
            {activeTab === 'settings' && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[50vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <Settings size={48} className="text-slate-700 mb-6 animate-spin-slow" />
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">Module Offline</h2>
                <p className="text-xs text-slate-600 uppercase tracking-widest leading-relaxed">System calibration in progress.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ExpertDashboard;