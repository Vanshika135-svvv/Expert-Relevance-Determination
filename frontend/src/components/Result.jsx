import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Target, Zap, ArrowLeft, 
  ShieldCheck, FileCheck, ChevronRight, 
  Download, BrainCircuit 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const Result = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  const candidateName = localStorage.getItem("username") || "Candidate";

  useEffect(() => {
    // Simulating secure handshake with the Relevance Engine to fetch evaluation metrics
    const fetchResults = () => {
      setTimeout(() => {
        setResultData({
          score: 8.7,
          status: 'Cleared',
          domain: 'AI / Machine Learning',
          expertAssigned: 'Dr. Alan Turing',
          relevanceMatch: '94%',
          timestamp: new Date().toLocaleString(),
          feedback: [
            "Strong grasp of neural network architectures.",
            "Excellent problem-solving during the live scenario.",
            "Demonstrated high proficiency in Python/TensorFlow integration."
          ],
          milestones: [
            { label: "Evaluation Phase", status: "complete" },
            { label: "Score Computation", status: "complete" },
            { label: "Digital Certification", status: "active" },
            { label: "HR Placement Sync", status: "pending" }
          ]
        });
        setLoading(false);
      }, 2500); 
    };
    fetchResults();
  }, []);

  // --- CORE LOGIC: PDF CERTIFICATE GENERATION ---
  const downloadCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [600, 400]
    });

    // 1. Background Layer
    doc.setFillColor(2, 6, 23); // Navy-950
    doc.rect(0, 0, 600, 400, 'F');
    
    // 2. Aesthetic Border
    doc.setDrawColor(6, 182, 212); // Cyan-500
    doc.setLineWidth(2);
    doc.rect(20, 20, 560, 360);

    // 3. Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text("NEXUS RAC VERIFIED", 300, 80, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("AEGIS AI NEURAL MATCHING SYSTEMS", 300, 100, { align: "center" });

    // 4. Verification Body
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

    // 5. Performance Metric
    doc.setFillColor(255, 255, 255, 0.05);
    doc.rect(200, 260, 200, 50, 'F');
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.setFontSize(22);
    doc.text(`SCORE: ${resultData.score} / 10.0`, 300, 292, { align: "center" });

    // 6. Institutional Footer
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("VALIDATED BY SHRI VAISHNAV VIDYAPEETH VISHWAVIDYALAYA, INDORE", 300, 350, { align: "center" });
    doc.text(`ISSUE DATE: ${resultData.timestamp} | NODE ID: RAC-${Math.floor(Math.random() * 10000)}`, 300, 365, { align: "center" });

    // Save Action
    doc.save(`${candidateName}_NexusRAC_Transcript.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center transition-all duration-1000">
        <div className={`absolute w-[45vw] h-[45vw] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000 ${
          loading ? 'bg-cyan-500/10 animate-pulse' : 'bg-emerald-500/10'
        }`} />
        {!loading && (
          <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        )}
      </div>

      <div className="w-full max-w-5xl z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            /* --- PHASE 1: COMPILING DATA --- */
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6"
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
                <p className="text-slate-500 uppercase tracking-widest text-xs mt-2">Decrypting Expert Assessment Node...</p>
              </div>
            </motion.div>
          ) : (
            /* --- PHASE 2: VERIFIED RESULT --- */
            <motion.div 
              key="content"
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              {/* Header Decorative Strip */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />

              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    <ShieldCheck size={12} /> Official Transcript
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-white">Nexus Verified</h1>
                  <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Node Identity: <span className="text-white">{candidateName}</span></p>
                </div>
                
                <div className="bg-emerald-500 text-black p-6 rounded-3xl flex flex-col items-center justify-center min-w-[140px] shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Final Score</p>
                  <span className="text-5xl font-black">{resultData.score}</span>
                  <p className="text-[10px] font-bold opacity-70">METRIC: 10.0</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                
                {/* Expert Feedback Panel */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Target size={14} className="text-cyan-400" /> Domain Focus
                      </p>
                      <p className="font-bold text-white text-lg">{resultData.domain}</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap size={14} className="text-blue-400" /> Neural Match
                      </p>
                      <p className="font-bold text-white text-lg">{resultData.relevanceMatch} Precision</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-6">Expert Observations</h3>
                    <div className="space-y-4">
                      {resultData.feedback.map((note, i) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                          <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Roadmap & Certification Column */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-8">Next Action Sequence</h3>
                    <div className="space-y-8 relative">
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5" />
                      {resultData.milestones.map((m, i) => (
                        <div key={i} className="flex gap-4 items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#020617] ${
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
                    className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-950/40"
                  >
                    <Download size={18} /> Generate Certificate
                  </button>
                </div>

              </div>

              {/* Action Footer */}
              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-white/5">
                <button 
                  onClick={() => navigate('/candidate')}
                  className="flex-grow py-4 bg-white text-black font-black tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-[0.98]"
                >
                  <ArrowLeft size={18} /> Return to Dashboard
                </button>
                <div className="flex items-center justify-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  Verified at: {resultData.timestamp}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Result;