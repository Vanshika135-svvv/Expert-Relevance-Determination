import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ShieldCheck, User, Lock, ChevronRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Send credentials to the Flask backend for hash verification
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/login', formData);

      if (res.data.status === "Success") {
        // --- THE FIX: USE res.data.username ---
        // We save the ACTUAL username from the database, not the identifier typed in the box.
        localStorage.setItem('username', res.data.username); 
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('skills', res.data.skills || 'N/A');

        // 2. Route to the correct dashboard based on the role retrieved from the DB
        const userRole = res.data.role;
        if (userRole === 'Candidate') navigate('/candidate');
        else if (userRole === 'Expert') navigate('/expert');
        else if (userRole === 'Admin') navigate('/admin');
      }
    } catch (err) {
      // Handle incorrect passwords or missing users
      setError(err.response?.data?.message || "Access Denied: Invalid identifier or security key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans selection:bg-cyan-500 overflow-hidden relative">
      
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden -z-10 flex items-center justify-center">
        <div className="absolute w-[45vw] h-[45vw] bg-cyan-500/15 blur-[120px] rounded-full animate-pulse mix-blend-screen" />
        <div className="absolute w-[35vw] h-[35vw] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen translate-x-1/2 translate-y-1/4" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Neon Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 shadow-[0_0_15px_#06b6d4]" />

        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="bg-cyan-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30 shadow-[0_0_30px_-5px_#06b6d4]"
          >
            <ShieldCheck className="text-cyan-400" size={40} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-widest bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
            Nexus Access
          </h1>
          <p className="text-slate-500 mt-2 text-sm tracking-widest uppercase font-bold">Identity Verification</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-3 font-semibold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Identifier</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors shadow-sm" size={18} />
              <input 
                type="text" 
                name="username"
                placeholder="Enter username or email"
                className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500/50 outline-none transition-all text-white placeholder:text-slate-700 font-medium"
                onChange={handleChange}
                value={formData.username}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.97]"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Authorize Session <ChevronRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs tracking-widest uppercase">
            No clearance?{' '}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors underline underline-offset-4">
              Create Profile
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;