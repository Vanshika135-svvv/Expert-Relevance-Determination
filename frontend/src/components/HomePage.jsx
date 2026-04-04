import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Users, Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 overflow-hidden relative">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-cyan-400" size={32} />
          <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            NEXUS RAC
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all">
            Sign In
          </Link>
          <Link to="/signup" className="px-5 py-2 rounded-xl text-sm font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="max-w-4xl"
        >
          <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Aegis AI Powered</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Expert Relevance <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Determination System
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A state-of-the-art neural matching engine that bridges the gap between candidate skill vectors and expert domains for optimal interview boards.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95">
              Initialize System <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature/Role Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          {/* Candidate Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl hover:border-cyan-500/30 transition-colors text-left group">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Users className="text-cyan-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">For Candidates</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Input your tech stack and skill vector. Let our Cosine Similarity engine find the perfect expert to evaluate your abilities fairly.
            </p>
          </div>

          {/* Expert Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl hover:border-blue-500/30 transition-colors text-left group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
              <BrainCircuit className="text-blue-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">For Experts</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Manage your interview boards. Connect with candidates whose skills directly align with your domain experience.
            </p>
          </div>

          {/* Admin Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl hover:border-purple-500/30 transition-colors text-left group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
              <Shield className="text-purple-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">For System Admins</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Monitor system health, view match logs, and oversee the entire relevance determination pipeline from a unified dashboard.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;