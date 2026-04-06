import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Activity, Users, Database, 
  LogOut, Settings, Plus, Server, Cpu 
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State for Board Creation
  const [board, setBoard] = useState({ subject: '', date: '' });
  const [loading, setLoading] = useState(false);

  // State for System Stats
  const [stats, setStats] = useState({
    status: 'Scanning...',
    db_status: 'Checking...',
    experts: 0,
    candidates: 0
  });

  // 1. DISCONNECT LOGIC: Clears session to allow Home Page access
  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/'); 
  };

  // 2. DIAGNOSTICS: Fetch real-time system health
  const fetchDiagnostics = async () => {
    try {
      const response = await axios.get('https://expert-relevance-determination.onrender.com/api/health_check');
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

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // 3. BOARD INITIALIZATION: Push new interview board to MongoDB
  const createBoard = async () => {
    if (!board.subject || !board.date) {
      alert("Please define Board Subject and Date.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://expert-relevance-determination.onrender.com/api/create_board', {
        subject: board.subject,
        date: board.date
      });
      alert(`Interview Board for '${board.subject}' successfully initialized!`);
      setBoard({ subject: '', date: '' });
    } catch (error) {
      alert('Failed to connect to Database to create board.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-8 relative overflow-hidden">
      
      {/* Admin Background Aesthetics */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-fuchsia-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <nav className="flex justify-between items-center mb-10 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
              <Shield className="text-red-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">AEGIS CONTROL</h1>
              <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest">Root Authority</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-900/20"
          >
            <LogOut size={16} /> Termination Sync
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Initialize Board Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-xl"
          >
            <Plus className="text-cyan-400 mb-6" size={32} />
            <h2 className="text-xl font-bold mb-6">Initialize Board</h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Interview Domain</label>
                <input 
                  type="text"
                  value={board.subject}
                  placeholder="e.g. Artificial Intelligence" 
                  className="w-full bg-black/20 border border-white/5 p-4 rounded-2xl outline-none focus:border-cyan-500/50 mt-1 transition-all text-sm"
                  onChange={(e) => setBoard({...board, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Session Date</label>
                <input 
                  type="date" 
                  value={board.date}
                  className="w-full bg-black/20 border border-white/5 p-4 rounded-2xl outline-none text-slate-400 focus:border-cyan-500/50 mt-1 transition-all text-sm"
                  onChange={(e) => setBoard({...board, date: e.target.value})}
                />
              </div>
              <button 
                onClick={createBoard} 
                disabled={loading}
                className="w-full py-4 mt-4 bg-gradient-to-r from-red-600 to-fuchsia-700 hover:from-red-500 hover:to-fuchsia-600 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-900/20 active:scale-95"
              >
                {loading ? "DEPLOYING..." : "DEPLOY INTERVIEW BOARD"}
              </button>
            </div>
          </motion.div>

          {/* Column 2 & 3: Diagnostics & Data Metrics */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Health Status */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className={`p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10 ${
                  stats.status === 'Optimal' ? 'bg-emerald-500/5' : 'bg-red-500/5'
                }`}
              >
                <Activity className={stats.status === 'Optimal' ? 'text-emerald-400 mb-4' : 'text-red-400 mb-4'} size={32} />
                <h3 className="text-lg font-bold">System Health</h3>
                <p className={`text-4xl font-black mt-2 ${stats.status === 'Optimal' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.status}
                </p>
                <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">Flask API Connectivity</p>
              </motion.div>

              {/* Database Status */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className={`p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10 ${
                  stats.db_status === 'Connected' ? 'bg-blue-500/5' : 'bg-red-500/5'
                }`}
              >
                <Server className={stats.db_status === 'Connected' ? 'text-blue-400 mb-4' : 'text-red-400 mb-4'} size={32} />
                <h3 className="text-lg font-bold">Database Status</h3>
                <p className={`text-4xl font-black mt-2 ${stats.db_status === 'Connected' ? 'text-blue-400' : 'text-red-400'}`}>
                  {stats.db_status}
                </p>
                <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">MongoDB Atlas Vector Sync</p>
              </motion.div>
            </div>

            {/* User Metrics & Logs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-md"
            >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold flex items-center gap-3">
                   <Database className="text-blue-400" size={24} /> Neural Access Logs
                 </h3>
                 <div className="flex gap-6">
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experts</p>
                       <p className="text-xl font-black text-white">{stats.experts}</p>
                    </div>
                    <div className="text-right border-l border-white/10 pl-6">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Candidates</p>
                       <p className="text-xl font-black text-white">{stats.candidates}</p>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-slate-400">
                  [SYSTEM] Secure handshake established with MongoDB Cluster...
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-emerald-400/70">
                  [SUCCESS] Data diagnostics fetch: {stats.experts} experts synced.
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-red-400/70">
                  [AUTH] Termination Sync available: Redirect shield active.
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;