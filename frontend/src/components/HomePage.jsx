import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, ArrowRight, CheckCircle2, 
  BarChart3, Globe, Zap, Target 
} from 'lucide-react';

const HomePage = () => {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 overflow-x-hidden">
      
      {/* Background Decorative Glow Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* 1. Header/Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#020617]/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-6 px-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <BrainCircuit className="text-cyan-400" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">NEXUS RAC</span>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#stats" className="hover:text-cyan-400 transition-colors">Impact</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">Process</a>
          </div>

          <Link to="/login" className="px-6 py-2.5 rounded-full bg-white text-black font-black text-xs uppercase hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Interface Access
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap size={14} /> AI-Powered Relevance Engine
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }} 
            className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter"
          >
            VALIDATE SKILLS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              MATCH EXPERTS.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The intelligent bridge between technical candidates and domain experts. 
            Automating board selection with 98% neural precision for SVVV Indore.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.6 }} 
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/signup" className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-white text-lg flex items-center gap-3 transition-all shadow-xl shadow-cyan-900/20 active:scale-95">
              GET STARTED <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black text-white text-lg transition-all">
              VIEW DEMO
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. Stats Section (Impact Metrics) */}
      <section id="stats" className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Neural Matches", val: "12K+" },
            { label: "Active Experts", val: "450+" },
            { label: "Skill Clusters", val: "89" },
            { label: "Accuracy Rate", val: "98.4%" }
          ].map((stat, i) => (
            <div key={i}>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">{stat.val}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Feature Cards Section */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Skill Verification */}
          <motion.div whileHover={{ y: -10 }} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <Target className="text-cyan-400 mb-6" size={40} />
            <h3 className="text-2xl font-black mb-4 text-white">Skill Verification</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Take AI-proctored assessments to validate your core tech stack. Get verified badges that experts trust.
            </p>
            <ul className="space-y-3">
              {['Smart Quizzes', 'Skill Badges', 'AI Audit'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <CheckCircle2 size={14} className="text-cyan-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Relevance Engine */}
          <motion.div whileHover={{ y: -10 }} className="p-10 rounded-[3rem] bg-blue-600/10 border border-blue-500/20 backdrop-blur-xl">
            <BarChart3 className="text-blue-400 mb-6" size={40} />
            <h3 className="text-2xl font-black mb-4 text-white">Relevance Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Our Cosine Similarity algorithm parses skill vectors to find experts whose domain matches your specific experience.
            </p>
            <ul className="space-y-3">
              {['NLP Processing', 'Vector Matching', 'Live Sync'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <CheckCircle2 size={14} className="text-blue-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Global Expert Panel */}
          <motion.div whileHover={{ y: -10 }} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <Globe className="text-purple-400 mb-6" size={40} />
            <h3 className="text-2xl font-black mb-4 text-white">Expert Panel</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Access a network of SVVV verified experts. Manage interview boards with real-time feedback loops and logging.
            </p>
            <ul className="space-y-3">
              {['Board Management', 'Live Logs', 'Admin Control'].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <CheckCircle2 size={14} className="text-purple-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-32 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-16 uppercase tracking-widest">The Process</h2>
          <div className="space-y-12 text-left">
            {[
              { step: "01", title: "Create Identity", desc: "Register as a Candidate or Expert and initialize your unique skill vector." },
              { step: "02", title: "AI Skill Validation", desc: "Our neural engine audits your profile and determines market-ready relevance." },
              { step: "03", title: "Smart Match Sync", desc: "Initiate the Relevance Engine to find the top-ranked expert for your specific board." }
            ].map((step, i) => (
              <div key={i} className="flex gap-8 items-start group">
                <span className="text-5xl font-black text-white/10 group-hover:text-cyan-500 transition-colors">{step.step}</span>
                <div>
                  <h4 className="text-xl font-black text-white mb-2">{step.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="p-12 border-t border-white/5 text-center bg-[#020617]">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
          &copy; 2026 AEGIS AI | NEXUS RAC SYSTEM
        </p>
        <p className="text-[10px] text-slate-700 uppercase tracking-widest font-black">
          Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore
        </p>
      </footer>
    </div>
  );
};

export default HomePage;