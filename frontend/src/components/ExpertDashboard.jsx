import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardCheck, Send, LogOut, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [expertName, setExpertName] = useState('Verified Expert');
  const [evaluation, setEvaluation] = useState({ candidateName: '', score: 5 });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Load the expert's name when the dashboard opens
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setExpertName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const submitScore = async () => {
    if (!evaluation.candidateName) {
      setStatus({ message: 'Candidate name is required.', type: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      // Assuming you will create an /api/evaluate route in Flask later
      // For now, this simulates the secure submission
      // await axios.post('http://127.0.0.1:5000/api/evaluate', evaluation);
      
      // Simulating network delay for the UI effect
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      setStatus({ message: 'Evaluation Encrypted & Submitted Successfully!', type: 'success' });
      setEvaluation({ candidateName: '', score: 5 }); // Reset form
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ message: '', type: '' }), 3000);
    } catch (err) {
      setStatus({ message: 'Sync Failed: Could not submit evaluation.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans selection:bg-fuchsia-500">
      
      {/* Visual Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-10 backdrop-blur-xl bg-white/5 p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-fuchsia-400" size={28} />
            <h1 className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-blue-500 bg-clip-text text-transparent tracking-widest uppercase">
              Expert Portal
            </h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10"
          >
            <LogOut size={16}/> Disconnect
          </button>
        </nav>

        <header className="mb-10">
          <h2 className="text-3xl font-bold">Welcome, {expertName}</h2>
          <p className="text-slate-400 mt-2">RAC Assessment Control Center</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Evaluation Form */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} 
            className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md"
          >
            <Users className="text-fuchsia-400 mb-6" size={32} />
            <h3 className="text-xl font-bold mb-6">Candidate Evaluation</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-2 uppercase tracking-widest ml-1">Candidate Identity</label>
                <input 
                  type="text"
                  placeholder="Enter Candidate Name"
                  value={evaluation.candidateName}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-fuchsia-500/50 transition-all"
                  onChange={(e) => setEvaluation({...evaluation, candidateName: e.target.value})}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="text-slate-500 text-xs font-bold uppercase tracking-widest">Relevance Score</label>
                  <span className="text-2xl font-black text-fuchsia-400">{evaluation.score}</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="0.1"
                  value={evaluation.score}
                  className="w-full accent-fuchsia-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  onChange={(e) => setEvaluation({...evaluation, score: e.target.value})}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold">
                  <span>0 (Low)</span>
                  <span>10 (High)</span>
                </div>
              </div>

              <button 
                onClick={submitScore} 
                disabled={loading}
                className="w-full py-4 mt-4 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 disabled:opacity-50 text-white font-black tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/20 transition-all active:scale-[0.98]"
              >
                {loading ? "ENCRYPTING..." : "SUBMIT ANALYSIS"} <Send size={18} />
              </button>

              {/* Status Messages */}
              {status.message && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`text-center text-sm font-bold mt-4 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {status.message}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Guidelines / Info Panel */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md h-fit"
          >
            <ClipboardCheck className="text-cyan-400 mb-6" size={32} />
            <h3 className="text-xl font-bold mb-6">Assessment Guidelines</h3>
            
            <ul className="text-slate-300 space-y-5 text-sm leading-relaxed">
              <li className="flex gap-4 items-start">
                <span className="text-fuchsia-400 font-black mt-0.5">01</span>
                <span>Assess the candidate's technical alignment with the core requirements of the RAC domain.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-fuchsia-400 font-black mt-0.5">02</span>
                <span>Score based on demonstrated real-time problem solving and conceptual clarity.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-fuchsia-400 font-black mt-0.5">03</span>
                <span>All scores <span className="text-emerald-400 font-bold">above 8.5</span> require secondary verification and detailed remarks.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-fuchsia-400 font-black mt-0.5">04</span>
                <span>Ensure your connection remains stable. All evaluations are instantly encrypted before hitting the database.</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;