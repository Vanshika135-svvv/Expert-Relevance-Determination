import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, BrainCircuit, Activity, 
  FileCheck, ChevronRight, Download, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import axios from 'axios';

const Result = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  // Identity & Profile Data
  const candidateName = localStorage.getItem("username") || "Candidate";
  const candidateSkills = localStorage.getItem("skills") || "Technology Domain";

  // --- 1. FETCH LIVE ASSESSMENT FROM MONGODB ---
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`https://expert-relevance-determination.onrender.com/api/assessments/${candidateName}`);
        
        if (res.data.status === 'Success') {
          const data = res.data.data;
          
          // Map backend data to our UI structure
          setResultData({
            score: data.score,
            status: 'Cleared',
            domain: candidateSkills,
            expertAssigned: data.expert_name,
            relevanceMatch: `${(data.score * 10).toFixed(1)}%`, // Extrapolates percentage from score
            timestamp: new Date(data.timestamp).toLocaleString(),
            feedback: formatRemarks(data.remarks),
            milestones: [
              { label: "Evaluation Phase", status: "complete" },
              { label: "Score Computation", status: "complete" },
              { label: "Digital Certification", status: "active" },
              { label: "HR Placement Sync", status: "pending" }
            ]
          });
        }
      } catch (err) {
        console.log("Assessment not ready yet or network error.");
        setResultData(null); // Triggers the "Awaiting Sync" Pending State
      } finally {
        setIsLoading(false);
      }
    };

    // Add a slight delay to make the "Decrypting" animation feel deliberate
    setTimeout(() => {
      fetchResults();
    }, 1500);
  }, [candidateName, candidateSkills]);

  // Helper to split expert remarks into bullet points
  const formatRemarks = (text) => {
    if (!text) return ["No detailed remarks provided by the expert."];
    return text.split('.').filter(sentence => sentence.trim().length > 0);
  };

  // --- 2. CORE LOGIC: PDF CERTIFICATE GENERATION ---
  const downloadCertificate = () => {
    if (!resultData) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [600, 400]
    });

    // Background Layer
    doc.setFillColor(2, 6, 23); // Navy-950
    doc.rect(0, 0, 600, 400, 'F');
    
    // Aesthetic Border
    doc.setDrawColor(6, 182, 212); // Cyan-500
    doc.setLineWidth(2);
    doc.rect(20, 20, 560, 360);

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text("NEXUS RAC VERIFIED", 300, 80, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("AEGIS AI NEURAL MATCHING SYSTEMS", 300, 100, { align: "center" });

    // Verification Body
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("This document certifies that", 300, 150, { align: "center" });

    doc.setFontSize(24);
    doc.setTextColor(34, 211, 238); // Cyan-400
    doc.text(candidateName.toUpperCase(), 300, 185, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`has successfully cleared the technical assessment in:`, 300, 220, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.text(resultData.domain, 300, 240, { align: "center" });

    // Performance Metric
    doc.setFillColor(255, 255, 255, 0.05);
    doc.rect(200, 260, 200, 50, 'F');
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.setFontSize(22);
    doc.text(`SCORE: ${resultData.score} / 10.0`, 300, 292, { align: "center" });

    // Institutional Footer
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("VALIDATED BY EXPERT NODE: " + resultData.expertAssigned.toUpperCase(), 300, 350, { align: "center" });
    doc.text(`ISSUE DATE: ${resultData.timestamp} | SECURE HASH: RAC-${Math.floor(Math.random() * 100000)}`, 300, 365, { align: "center" });

    // Save Action
    doc.save(`${candidateName.replace(/\s+/g, '_')}_Nexus_Transcript.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col selection:bg-cyan-500 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none transition-all duration-1000">
        <div className={`absolute top-[10%] left-[20%] w-[40vw] h-[40vw] blur-[150px] rounded-full mix-blend-screen transition-colors duration-1000 ${
          isLoading ? 'bg-cyan-600/10 animate-pulse' : 'bg-emerald-500/10'
        }`} />
        <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="h-20 px-6 md:px-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={20} />
            </div>
          </div>
          <h1 className="text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Nexus Command
          </h1>
        </div>
        <button 
          onClick={() => navigate('/candidate-dashboard')}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative z-10 w-full overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          
          {isLoading ? (
            /* --- STATE 1: LOADING & DECRYPTING --- */
            <motion.div 
              key="loading" 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="flex flex-col items-center justify-center space-y-6 my-auto"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="text-cyan-400 animate-pulse" size={32} />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-[0.3em] uppercase text-cyan-400">Compiling Matrix</h2>
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2 animate-pulse">Decrypting Expert Assessment Node...</p>
              </div>
            </motion.div>

          ) : !resultData ? (
            /* --- STATE 2: PENDING (EXPERT HASN'T SUBMITTED YET) --- */
            <motion.div 
              key="pending" 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-md text-center shadow-2xl my-auto"
            >
              <Clock className="w-20 h-20 text-blue-400 mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Awaiting Sync</h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                Your session has concluded, but the expert is still finalizing your evaluation matrix. Please return to your dashboard and check back shortly.
              </p>
              <button 
                onClick={() => navigate('/candidate-dashboard')}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95"
              >
                Return to Dashboard
              </button>
            </motion.div>

          ) : (
            /* --- STATE 3: OFFICIAL RESULT (FETCHED FROM DB) --- */
            <motion.div 
              key="result" 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} 
              className="max-w-5xl w-full bg-white/5 border border-white/10 rounded-[3.5rem] backdrop-blur-2xl relative overflow-hidden shadow-2xl my-auto"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
              
              <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10">
                
                {/* Left Side (Identity & Observations) */}
                <div className="flex-[2] flex flex-col">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full w-fit mb-6">
                    <ShieldCheck size={12} /> Official Transcript
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-white">Nexus Verified</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mb-10">
                    Node Identity: <span className="text-white">{candidateName}</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
                      <p className="flex items-center gap-2 text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-2"><BrainCircuit size={14}/> Domain Focus</p>
                      <p className="font-bold text-white text-lg">{resultData.domain}</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
                      <p className="flex items-center gap-2 text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2"><Activity size={14}/> Evaluator</p>
                      <p className="font-bold text-white text-lg">{resultData.expertAssigned}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-6">Expert Observations</h3>
                    <div className="space-y-4">
                      {resultData.feedback.map((remark, idx) => (
                        <div key={idx} className="flex gap-4 items-start group">
                          <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                          <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">{remark.trim()}.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side (Score & Certificate) */}
                <div className="flex-[1] flex flex-col gap-6">
                  
                  <div className="bg-emerald-500 rounded-[2rem] p-8 text-center text-black shadow-[0_0_40px_rgba(16,185,129,0.3)] relative overflow-hidden flex-shrink-0">
                    <div className="absolute -right-4 -top-4 opacity-20"><Activity size={120} /></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 relative z-10">Final Score</p>
                    <h1 className="text-7xl font-black relative z-10 tracking-tighter">{resultData.score}</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-2 relative z-10">Metric: 10.0</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex-1 relative overflow-hidden">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-8">Verification Sequence</h3>
                    <div className="space-y-8 relative">
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5" />
                      {resultData.milestones.map((m, i) => (
                        <div key={i} className="flex gap-4 items-center relative z-10">
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-4 border-[#020617] ${
                            m.status === 'complete' ? 'bg-emerald-500' : m.status === 'active' ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'
                          }`}>
                            {m.status === 'complete' ? <FileCheck size={12} className="text-white" /> : <ChevronRight size={12} className="text-white" />}
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            m.status === 'pending' ? 'text-slate-600' : 'text-slate-200'
                          }`}>
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={downloadCertificate}
                    className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-950/40 shrink-0"
                  >
                    <Download size={18} /> Download Certificate
                  </button>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Result;