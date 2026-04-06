import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldPlus, User, Lock, Cpu, Zap, ArrowRight, Mail } from 'lucide-react';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  
  // 1. Updated state to include Email
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    role: 'Candidate', 
    skills: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      // 2. Send the updated data to your Flask backend
      const res = await axios.post('https://expert-relevance-determination.onrender.com/api/signup', formData);
      
      if (res.data.status === "Success" || res.status === 200) {
        
        // 3. Auto-Login: Save username, role, and skills to LocalStorage
        localStorage.setItem('username', formData.username);
        localStorage.setItem('role', formData.role);
        localStorage.setItem('skills', formData.skills || 'N/A');

        setStatusMessage({ text: 'Registration Successful! Initializing Dashboard...', type: 'success' });
        
        // 4. Dynamic Redirect after success
        setTimeout(() => {
          if (formData.role === 'Candidate') {
            navigate('/candidate');
          } else if (formData.role === 'Expert') {
            navigate('/expert');
          } else if (formData.role === 'Admin') {
            navigate('/admin');
          } else {
            navigate('/'); 
          }
        }, 1500);

      } else {
        setStatusMessage({ text: res.data.message || 'Registration failed.', type: 'error' });
      }

    } catch (err) {
      console.error(err);
      setStatusMessage({ 
        text: err.response?.data?.message || err.response?.data?.error || 'Registration failed. Check backend connection.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans selection:bg-fuchsia-500 relative">
      
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden -z-10 flex items-center justify-center">
        <div className="absolute w-[40vw] h-[40vw] bg-fuchsia-500/20 blur-[120px] rounded-full animate-pulse mix-blend-screen -translate-x-1/4" />
        <div className="absolute w-[30vw] h-[30vw] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen translate-x-1/4 translate-y-1/4" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-blue-500 to-cyan-400" />

        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-fuchsia-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-fuchsia-500/30 shadow-[0_0_30px_-5px_#d946ef]"
          >
            <ShieldPlus className="text-fuchsia-400" size={32} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-widest bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
            Create Access
          </h1>
          <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">Nexus RAC Registration</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* Role Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Account Type</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-400 transition-colors" size={18} />
              <select 
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-fuchsia-500/50 outline-none appearance-none transition-all cursor-pointer text-white font-bold tracking-wider"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                value={formData.role}
              >
                <option className="bg-[#0f172a] text-white" value="Candidate">Candidate Assessment</option>
                <option className="bg-[#0f172a] text-white" value="Expert">Expert Panel</option>
                <option className="bg-[#0f172a] text-white" value="Admin">System Admin</option>
              </select>
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Communication Channel</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="expert@nexus-rac.ai"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-fuchsia-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Identifier</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-fuchsia-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Create a secure password"
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-fuchsia-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Conditional Skills Input */}
          <AnimatePresence>
            {formData.role === 'Candidate' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1 mt-2">Core Skill Vector</label>
                <div className="relative group">
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g., Python, React, AI, MongoDB"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-fuchsia-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    required={formData.role === 'Candidate'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Message */}
          {statusMessage.text && (
            <p className={`text-center text-xs font-bold ${statusMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {statusMessage.text}
            </p>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 disabled:opacity-50 text-white font-black tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-fuchsia-900/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>REGISTER IDENTITY <Zap size={18} className="fill-current" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-fuchsia-400 hover:text-fuchsia-300 font-bold inline-flex items-center gap-1 transition-colors">
              Initialize Session <ArrowRight size={14} />
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Signup;