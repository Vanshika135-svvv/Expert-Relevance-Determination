import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Cpu, LogOut, AlertTriangle } from 'lucide-react';

// Import the Glassmorphism card component
import MatchResultsCard from './MatchResultsCard';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  
  // State for handling the array of experts returned by the AI
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pull data from local storage
  const [user, setUser] = useState({
    name: 'Candidate',
    skills: 'N/A'
  });

  useEffect(() => {
    // This pulls the actual name saved during the updated Login sequence
    const storedName = localStorage.getItem("username");
    const storedSkills = localStorage.getItem("skills");
    
    if (storedName) {
      setUser({
        name: storedName,
        skills: storedSkills || 'N/A'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // Redirect to login page
  };

  const runMatching = async () => {
    setLoading(true);
    setError('');
    setExperts([]);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/match', {
        skills: user.skills,
        username: user.name
      });
      
      // We expect an array of experts from the updated Flask backend
      if (Array.isArray(res.data) && res.data.length > 0) {
        const formattedMatches = res.data.map((expert, index) => ({
          id: expert.id || index,
          expert_name: expert.expert_name,
          domain: expert.domain,
          experience: expert.experience || 5,
          score: expert.score 
        }));
        
        setExperts(formattedMatches);
      } else {
        setError("No experts found with a match score of 10% or higher.");
      }
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("AI Sync Failed: Make sure the Flask backend is running on port 5000.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans selection:bg-cyan-500">
      
      {/* Visual Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-10 backdrop-blur-xl bg-white/5 p-6 rounded-3xl border border-white/10 shadow-lg">
          <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-widest">
            NEXUS RAC
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10"
          >
            <LogOut size={16}/> Disconnect
          </button>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Profile Section */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md h-fit shadow-xl"
          >
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30">
              <User className="text-cyan-400" size={32} />
            </div>
            
            {/* Displaying the actual name here */}
            <h2 className="text-2xl font-bold mb-1 break-words">{user.name}</h2>
            <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest">CSE AI Candidate</p>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skill Vector</p>
              <div className="p-4 bg-black/20 border border-white/5 rounded-2xl text-cyan-300 text-sm leading-relaxed">
                {user.skills}
              </div>
            </div>
          </motion.div>

          {/* Right Column: AI Matching Engine */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md flex flex-col justify-between shadow-xl"
          >
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Cpu className="text-blue-400" size={28}/> Relevance Engine
              </h3>
              
              {/* Display Window */}
              <div className="min-h-55 flex items-center justify-center border-2 border-dashed border-white/10 rounded-4xl mb-8 bg-black/20 p-6 relative overflow-hidden">
                
                {loading ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                    <p className="text-cyan-400 animate-pulse tracking-widest uppercase text-sm font-bold">Computing Neural Similarity...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <AlertTriangle className="text-red-400 mx-auto mb-3" size={40} />
                    <p className="text-red-400 font-bold">{error}</p>
                  </div>
                ) : experts && experts.length > 0 ? (
                  <div className="w-full h-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     <MatchResultsCard experts={experts} />
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-10">
                    <Cpu className="mx-auto mb-4 opacity-50" size={40} />
                    <p className="italic">Ready to interface with Expert Board.</p>
                    <p className="text-sm mt-2">Initialize matching sequence when ready.</p>
                  </div>
                )}

              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={runMatching}
              disabled={loading || !user.skills}
              className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98]"
            >
              {loading ? "PROCESSING..." : "INITIATE AI SYNC"}
            </button>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;