import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Settings, LogOut, ChevronLeft, ChevronRight, 
  ShieldCheck, BrainCircuit, Terminal, Send, BellRing, Database, Plus, Server
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // --- UI & Navigation States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- BROADCAST STATES ---
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendState, setSendState] = useState('');

  // --- SYSTEM & BOARD STATES ---
  const [board, setBoard] = useState({ subject: '', date: '' });
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [stats, setStats] = useState({
    status: 'Scanning...',
    db_status: 'Checking...',
    experts: 0,
    candidates: 0
  });

  const adminName = localStorage.getItem('username') || 'System Admin';

  // --- INITIALIZATION & POLLING ---
  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 30000); // Auto-refresh health every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- 1. SYSTEM DIAGNOSTICS LOGIC ---
  const fetchDiagnostics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health_check');
      setStats(response.data);
    } catch (error) {
      setStats({
        status: 'Critical',
        db_status: 'Disconnected',
        experts: 0,
        candidates: 0
      });
    }
  };

  // --- 2. BOARD INITIALIZATION LOGIC ---
  const createBoard = async () => {
    if (!board.subject || !board.date) {
      alert("Please define Board Subject and Date.");
      return;
    }

    setLoadingBoard(true);
    try {
      await axios.post('http://localhost:5000/api/create_board', {
        subject: board.subject,
        date: board.date
      });
      alert(`Interview Board for '${board.subject}' successfully initialized!`);
      setBoard({ subject: '', date: '' });
    } catch (error) {
      alert('Failed to connect to Database to create board.');
    } finally {
      setLoadingBoard(false);
    }
  };

  // --- 3. SEND NOTIFICATION TO MATRIX LOGIC ---
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;

    setIsSending(true);
    setSendState('');

    try {
      await axios.post('http://localhost:5000/api/notifications', {
        recipient: broadcastTarget, // 'ALL' triggers a system-wide blast
        sender: `Admin: ${adminName}`,
        message: broadcastMessage,
        type: "alert"
      });
      setSendState('Transmission successful.');
      setBroadcastMessage('');
    } catch (err) {
      setSendState('Transmission failed. Check database link.');
    } finally {
      setIsSending(false);
      setTimeout(() => setSendState(''), 4000);
    }
  };

  // --- REUSABLE SIDEBAR COMPONENT ---
  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        activeTab === id 
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
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
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden selection:bg-purple-500 selection:text-black font-sans">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[20%] w-[30vw] h-[30vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- SIDEBAR --- */}
      <motion.aside animate={{ width: isSidebarOpen ? 280 : 100 }} className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 relative z-20 shrink-0">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-4 top-10 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center"><Terminal className="text-purple-400" size={24} /></div>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
                <h2 className="text-sm font-black tracking-widest uppercase">Nexus Command</h2>
                <p className="text-[9px] text-purple-500 font-bold tracking-[0.2em] uppercase">Root Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-3">
          <SidebarItem icon={Activity} label="System Status" id="overview" />
          <SidebarItem icon={BellRing} label="Broadcast Node" id="broadcast" />
          <SidebarItem icon={Database} label="Vault Analytics" id="database" />
          <SidebarItem icon={Users} label="User Roles" id="users" />
        </nav>

        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group mt-4 shrink-0">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence>
            {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden">Sever Root Link</motion.span>}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Root: {adminName}</h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: <span className="text-purple-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span> Override Active</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-pulse shrink-0">
            <ShieldCheck className="text-purple-400" size={18} />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB: SYSTEM STATUS & BOARD INITIALIZATION */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Column 1: Initialize Board Form */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-xl">
                    <Plus className="text-purple-400 mb-6" size={32} />
                    <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6">Initialize Board</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Interview Domain</label>
                        <input 
                          type="text"
                          value={board.subject}
                          placeholder="e.g. Artificial Intelligence" 
                          className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500/50 mt-2 transition-all text-sm font-medium"
                          onChange={(e) => setBoard({...board, subject: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Session Date</label>
                        <input 
                          type="date" 
                          value={board.date}
                          className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500/50 mt-2 transition-all text-sm font-medium text-slate-300"
                          onChange={(e) => setBoard({...board, date: e.target.value})}
                        />
                      </div>
                      <button 
                        onClick={createBoard} 
                        disabled={loadingBoard}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-purple-900/30 active:scale-[0.98]"
                      >
                        {loadingBoard ? "DEPLOYING..." : "DEPLOY INTERVIEW BOARD"}
                      </button>
                    </div>
                  </div>

                  {/* Column 2 & 3: Diagnostics & Data Metrics */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Health Status */}
                      <div className={`p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10 ${stats.status === 'Optimal' ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                        <Activity className={stats.status === 'Optimal' ? 'text-emerald-400 mb-4' : 'text-red-400 mb-4'} size={32} />
                        <h3 className="text-lg font-black uppercase tracking-widest">System Health</h3>
                        <p className={`text-4xl font-black tracking-tighter mt-2 ${stats.status === 'Optimal' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stats.status}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">Flask API Connectivity</p>
                      </div>

                      {/* Database Status */}
                      <div className={`p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10 ${stats.db_status === 'Connected' ? 'bg-blue-500/5' : 'bg-red-500/5'}`}>
                        <Server className={stats.db_status === 'Connected' ? 'text-blue-400 mb-4' : 'text-red-400 mb-4'} size={32} />
                        <h3 className="text-lg font-black uppercase tracking-widest">Database Status</h3>
                        <p className={`text-4xl font-black tracking-tighter mt-2 ${stats.db_status === 'Connected' ? 'text-blue-400' : 'text-red-400'}`}>
                          {stats.db_status}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">MongoDB GridFS & Vectors</p>
                      </div>
                    </div>

                    {/* User Metrics & Logs */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                          <Database className="text-blue-400" size={24} /> Neural Access Logs
                        </h3>
                        <div className="flex gap-6">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experts</p>
                            <p className="text-2xl font-black text-white">{stats.experts}</p>
                          </div>
                          <div className="text-left md:text-right border-l border-white/10 pl-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Candidates</p>
                            <p className="text-2xl font-black text-white">{stats.candidates}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-slate-400">
                          [SYSTEM] Secure handshake established with MongoDB Cluster...
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-emerald-400/80">
                          [SUCCESS] Data diagnostics fetch: {stats.experts} experts synced.
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-purple-400/80">
                          [AUTH] Root level override active. Ready for broadcast.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* BROADCAST TAB: SEND SYSTEM NOTIFICATIONS */}
            {activeTab === 'broadcast' && (
              <motion.div key="broadcast" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto mt-10">
                <div className="mb-8 text-center">
                  <BellRing size={48} className="mx-auto mb-6 text-purple-400" />
                  <h2 className="text-3xl font-black uppercase tracking-widest text-white">Command Broadcast</h2>
                  <p className="text-sm text-slate-400 font-medium mt-2">Transmit overriding alerts to the global Notification Matrix or specific nodes.</p>
                </div>

                <form onSubmit={handleBroadcast} className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-md shadow-2xl">
                  
                  <div className="mb-8">
                    <label className="block text-slate-500 text-[10px] font-black mb-3 uppercase tracking-widest ml-2">Target Node Identity</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={broadcastTarget}
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        placeholder="Type 'ALL' for global broadcast, or specific username..." 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-purple-500/50 transition-all font-medium text-white shadow-inner uppercase tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-slate-500 text-[10px] font-black mb-3 uppercase tracking-widest ml-2">Transmission Data</label>
                    <textarea 
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enter system alert or interview override notification here..." 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-purple-500/50 transition-all font-medium text-white shadow-inner min-h-[150px] resize-y custom-scrollbar"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={!broadcastMessage || isSending}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-[0.3em] uppercase rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-purple-900/40 transition-all active:scale-[0.98]"
                  >
                    {isSending ? "TRANSMITTING..." : "FIRE BROADCAST"} <Send size={16} />
                  </button>

                  {sendState && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center text-xs tracking-widest font-bold mt-6 uppercase ${sendState.includes('failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {sendState}
                    </motion.p>
                  )}
                </form>
              </motion.div>
            )}

            {/* PLACEHOLDERS FOR RESTRICTED TABS */}
            {(activeTab === 'database' || activeTab === 'users') && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[50vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <Settings size={48} className="text-slate-700 mb-6 animate-spin-slow" />
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">Sub-System Restricted</h2>
                <p className="text-xs text-slate-600 uppercase tracking-widest leading-relaxed">This sector of the root admin portal requires level 5 clearance or is undergoing maintenance.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;