import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Zap, 
  Target,
  ShieldCheck,
  Cpu,
  Network,
  Terminal,
  Database,
  Code
} from 'lucide-react';

const HomePage = () => {
  // ==========================================
  // ANIMATION VARIANTS
  // ==========================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden relative">
      
      {/* --- ANIMATED BACKGROUND GLOWS --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-fuchsia-600/10 blur-[150px] rounded-full mix-blend-screen" 
        />
      </div>

      {/* --- 1. GLOBAL NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl border-b border-white/5 bg-[#020617]/70 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-5 px-6 md:px-10">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <BrainCircuit className="text-cyan-400" size={24} />
            </div>
            <div className="flex flex-col">
              {/* REBRANDED TO AEGIS */}
              <span className="text-xl font-black tracking-widest text-white leading-none">AEGIS</span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-cyan-400 uppercase leading-none mt-1">RAC System</span>
            </div>
          </Link>
          
          {/* Center Links (Hidden on Mobile) */}
          <div className="hidden md:flex gap-10 text-xs font-black text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#stats" className="hover:text-cyan-400 transition-colors">Impact</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">Process</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="hidden md:block px-6 py-2.5 rounded-full text-white font-black text-[10px] tracking-widest uppercase hover:text-cyan-400 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-3 rounded-full bg-cyan-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
            >
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          {/* Top Pill Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <Zap size={14} className="animate-pulse" /> Aegis AI-Powered Engine v4.5
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-8 tracking-tighter"
          >
            VALIDATE SKILLS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              MATCH EXPERTS.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium"
          >
            The intelligent bridge between technical candidates and domain experts. 
            Automating interview board selection with 98% neural precision for SVVV Indore.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-center items-center gap-5"
          >
            <Link 
              to="/signup" 
              className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-black text-white text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_rgba(6,182,212,0.4)] active:scale-95 hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]"
            >
              INITIALIZE CONNECTION <ArrowRight size={16} />
            </Link>
            <Link 
              to="/login" 
              className="w-full md:w-auto px-12 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black text-white text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all backdrop-blur-md"
            >
              ACCESS PORTAL
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50"
        >
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-cyan-500 to-transparent" />
        </motion.div>
      </section>

      {/* --- NEW FEATURE: LIVE SYSTEM TICKER --- */}
      <div className="w-full bg-cyan-900/10 border-y border-cyan-500/20 py-3 overflow-hidden flex whitespace-nowrap relative z-10 backdrop-blur-md">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 items-center text-[10px] font-mono text-cyan-400 tracking-widest uppercase"
        >
          {Array(8).fill("SYSTEM NOMINAL • NLP CLUSTER ACTIVE • VECTOR MATCHING ONLINE • SVVV NODE CONNECTED • ").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* --- 3. STATS SECTION --- */}
      <section id="stats" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Neural Matches", val: "12K+", icon: BrainCircuit, color: "text-cyan-400" },
              { label: "Active Experts", val: "450+", icon: ShieldCheck, color: "text-fuchsia-400" },
              { label: "Skill Clusters", val: "89", icon: Network, color: "text-blue-400" },
              { label: "Accuracy Rate", val: "98.4%", icon: Target, color: "text-emerald-400" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl text-center group hover:bg-white/10 transition-colors hover:border-cyan-500/30"
              >
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 ${stat.color} group-hover:scale-110 group-hover:shadow-[0_0_20px_currentColor] transition-all`}>
                    <stat.icon size={28} />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                  {stat.val}
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. FEATURES SECTION --- */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">Core Infrastructure</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest">Platform Capabilities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            whileHover={{ y: -10 }} 
            className="p-10 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/30 transition-colors duration-500" />
            <Target className="text-cyan-400 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300" size={48} />
            <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-wider relative z-10">
              Skill Verification
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 relative z-10 font-medium">
              Take AI-proctored assessments to validate your core tech stack. Get verified badges that experts trust before the interview begins.
            </p>
            <ul className="space-y-4 relative z-10">
              {['Smart Quizzes', 'Skill Badges', 'AI Profile Audit'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-cyan-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            whileHover={{ y: -10 }} 
            className="p-10 rounded-[3rem] bg-gradient-to-b from-blue-600/10 to-transparent border border-blue-500/20 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/30 transition-colors duration-500" />
            <Cpu className="text-blue-400 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300" size={48} />
            <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-wider relative z-10">
              Relevance Engine
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 relative z-10 font-medium">
              Our advanced algorithms parse skill vectors to dynamically find experts whose domain perfectly matches your specific experience level.
            </p>
            <ul className="space-y-4 relative z-10">
              {['NLP Processing', 'Vector Matching', 'Live Schedule Sync'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-blue-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            whileHover={{ y: -10 }} 
            className="p-10 rounded-[3rem] bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-fuchsia-500/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[50px] rounded-full group-hover:bg-fuchsia-500/30 transition-colors duration-500" />
            <Globe className="text-fuchsia-400 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300" size={48} />
            <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-wider relative z-10">
              Global Panel
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 relative z-10 font-medium">
              Access a network of verified industry experts. Manage interview boards with real-time feedback loops and secure data vaults.
            </p>
            <ul className="space-y-4 relative z-10">
              {['Board Management', 'Live Terminal Logs', 'Root Admin Control'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-fuchsia-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </section>

      {/* --- NEW FEATURE: TECH STACK BADGES --- */}
      <section className="py-20 relative z-10 bg-black/20 border-y border-white/5">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">System Architecture Powered By</h4>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-70">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-sm"><Code size={18} className="text-cyan-400"/> React.js</div>
              <div className="flex items-center gap-2 text-slate-300 font-mono text-sm"><Terminal size={18} className="text-blue-400"/> Python Flask</div>
              <div className="flex items-center gap-2 text-slate-300 font-mono text-sm"><Database size={18} className="text-emerald-400"/> MongoDB</div>
              <div className="flex items-center gap-2 text-slate-300 font-mono text-sm"><BrainCircuit size={18} className="text-fuchsia-400"/> Scikit-Learn NLP</div>
            </div>
         </div>
      </section>

      {/* --- 5. PROCESS TIMELINE SECTION --- */}
      <section id="how-it-works" className="py-32 relative z-10 bg-transparent">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-fuchsia-400 uppercase tracking-[0.3em] mb-4">Initialization</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest">The Process</h3>
          </div>
          
          <div className="space-y-16 relative">
            {/* Vertical Line */}
            <div className="absolute left-[39px] md:left-[49px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-fuchsia-500 opacity-20" />
            
            {[
              { step: "01", title: "Create Identity", desc: "Register as a Candidate or Expert in the Aegis Matrix. Initialize your unique skill vector and secure your data vault." },
              { step: "02", title: "AI Skill Validation", desc: "Our neural engine audits your profile, ranks your competencies, and determines market-ready relevance." },
              { step: "03", title: "Smart Match Sync", desc: "Initiate the Relevance Engine to dynamically find and schedule the top-ranked expert for your specific interview board." }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex gap-8 md:gap-12 items-start relative z-10 group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-[#020617] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
                  <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-600 group-hover:from-cyan-400 group-hover:to-blue-600 transition-all">
                    {step.step}
                  </span>
                </div>
                <div className="pt-2 md:pt-4">
                  <h4 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{step.title}</h4>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. FOOTER --- */}
      <footer className="py-12 border-t border-white/5 text-center bg-[#020617] relative z-10">
        <div className="flex justify-center mb-6">
          <BrainCircuit size={24} className="text-slate-600" />
        </div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
          &copy; 2026 AEGIS AI | AEGIS RAC SYSTEM
        </p>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore
        </p>
      </footer>

    </div>
  );
};

export default HomePage;