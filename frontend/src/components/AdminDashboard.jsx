import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Activity, Server, Users } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [board, setBoard] = useState({ subject: '', date: '' });
  const [stats, setStats] = useState({
    status: 'Scanning...',
    db_status: 'Checking...',
    experts: 0,
    candidates: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch real-time system diagnostics from your Flask backend
  const fetchDiagnostics = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/health_check');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch diagnostics", error);
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
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  const createBoard = async () => {
    if (!board.subject || !board.date) {
      alert("Please define Board Subject and Date.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:5000/api/create_board', {
        subject: board.subject,
        date: board.date
      });
      alert(`Interview Board for '${board.subject}' successfully initialized in MongoDB!`);
      setBoard({ subject: '', date: '' }); // Reset form
    } catch (error) {
      alert('Failed to connect to Database to create board.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans selection:bg-cyan-500">
      
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[30%] h-[30%] bg-fuchsia-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center gap-4 mb-10 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <Settings className="text-cyan-400" size={28} />
          <h1 className="text-2xl font-black tracking-widest bg-linear-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
            RAC COMMAND CENTER
          </h1>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Board Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md"
          >
            <Plus className="text-cyan-400 mb-6" size={32} />
            <h2 className="text-xl font-bold mb-6">Initialize Board</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Domain</label>
                <input 
                  type="text"
                  value={board.subject}
                  placeholder="e.g. Artificial Intelligence" 
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-500/50 mt-1 transition-all"
                  onChange={(e) => setBoard({...board, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Date</label>
                <input 
                  type="date" 
                  value={board.date}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-slate-300 focus:border-cyan-500/50 mt-1 transition-all"
                  onChange={(e) => setBoard({...board, date: e.target.value})}
                />
              </div>
              <button 
                onClick={createBoard} 
                disabled={loading}
                className="w-full py-4 mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-cyan-900/20"
              >
                {loading ? "DEPLOYING..." : "DEPLOY BOARD"}
              </button>
            </div>
          </motion.div>

          {/* System Diagnostics */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Health Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className={`border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md transition-colors ${
                stats.status === 'Optimal' ? 'bg-emerald-500/10' : 'bg-red-500/10'
              }`}
            >
              <Activity className={stats.status === 'Optimal' ? 'text-emerald-400 mb-4' : 'text-red-400 mb-4'} size={32} />
              <h3 className="text-lg font-bold">System Health</h3>
              <p className={`text-3xl font-black mt-2 ${stats.status === 'Optimal' ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.status}
              </p>
              <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Flask API Core</p>
            </motion.div>

            {/* DB Connection Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className={`border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md transition-colors ${
                stats.db_status === 'Connected' ? 'bg-blue-500/10' : 'bg-red-500/10'
              }`}
            >
              <Server className={stats.db_status === 'Connected' ? 'text-blue-400 mb-4' : 'text-red-400 mb-4'} size={32} />
              <h3 className="text-lg font-bold">Database Status</h3>
              <p className={`text-3xl font-black mt-2 ${stats.db_status === 'Connected' ? 'text-blue-400' : 'text-red-400'}`}>
                {stats.db_status}
              </p>
              <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">MongoDB Atlas Sync</p>
            </motion.div>

            {/* Data Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md grid grid-cols-2 gap-8"
            >
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-fuchsia-400" size={20} />
                    <h3 className="font-bold">Active Experts</h3>
                  </div>
                  <p className="text-4xl font-black text-white">{stats.experts}</p>
                  <p className="text-slate-500 text-xs mt-1 uppercase">Loaded in Matrix</p>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-cyan-400" size={20} />
                    <h3 className="font-bold">Pending Candidates</h3>
                  </div>
                  <p className="text-4xl font-black text-white">{stats.candidates}</p>
                  <p className="text-slate-500 text-xs mt-1 uppercase">Awaiting Match</p>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;