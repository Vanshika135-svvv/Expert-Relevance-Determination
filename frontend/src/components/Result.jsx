import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, ArrowLeft, BarChart2, ShieldCheck } from 'lucide-react';

const Result = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  const candidateName = localStorage.getItem("username") || "Candidate";

  useEffect(() => {
    // Simulating an API call to fetch the evaluation results from the database
    // In a real scenario, you would use axios.get('http://127.0.0.1:5000/api/get_result/...')
    const fetchResults = () => {
      setTimeout(() => {
        setResultData({
          score: 8.7,
          status: 'Cleared',
          domain: 'AI / Machine Learning',
          expertAssigned: 'Dr. Alan Turing',
          feedback: [
            "Strong grasp of neural network architectures.",
            "Excellent problem-solving during the live scenario.",
            "Relevance Engine alignment was 94%."
          ]
        });
        setLoading(false);
      }, 2000); // 2-second dramatic calculation delay
    };

    fetchResults();
  }, []);

  const handleReturn = () => {
    navigate('/candidate');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 font-sans selection:bg-emerald-500 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Glows based on Loading/Success state */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center transition-all duration-1000">
        {loading ? (
          <div className="absolute w-[40vw] h-[40vw] bg-cyan-500/20 blur-[150px] rounded-full animate-pulse mix-blend-screen" />
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
          </>
        )}
      </div>

      <div className="w-full max-w-4xl z-10">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart2 className="text-cyan-400 animate-pulse" size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-widest uppercase text-cyan-400">Compiling Matrix Data</h2>
            <p className="text-slate-400 uppercase tracking-widest text-sm">Decrypting Expert Assessment...</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }}
            className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />

            <div className="text-center mb-10">
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_#34d399]">
                <Trophy className="text-emerald-400" size={40} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">Evaluation Complete</h1>
              <p className="text-slate-400 uppercase tracking-widest text-sm">Candidate: <span className="text-white font-bold">{candidateName}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              
              {/* Score Card */}
              <div className="md:col-span-1 bg-black/40 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Final RAC Score</p>
                <div className="text-7xl font-black bg-gradient-to-br from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                  {resultData.score}
                </div>
                <p className="text-slate-400 font-mono text-sm">/ 10.0</p>
                
                <div className="mt-6 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Cleared</span>
                </div>
              </div>

              {/* Details & Feedback */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Target size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Domain</span>
                    </div>
                    <p className="font-bold text-lg">{resultData.domain}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Zap size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Expert Panel</span>
                    </div>
                    <p className="font-bold text-lg">{resultData.expertAssigned}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-4">Official Remarks</h3>
                  <ul className="space-y-3">
                    {resultData.feedback.map((note, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                        <span className="text-emerald-400 font-black mt-0.5">›</span> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button 
              onClick={handleReturn}
              className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={18} /> Return to Dashboard
            </button>

          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Result;