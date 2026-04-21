import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  BrainCircuit, 
  Terminal, 
  Send, 
  BellRing, 
  Database, 
  Plus, 
  Server, 
  Bell, 
  ArrowRight,
  Search,
  CheckCircle2,
  Zap,
  HardDrive,    
  CloudRain,    
  ShieldAlert,  
  UserCog,      
  Lock,
  FileText,
  Video
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  // ==========================================
  // 1. ROUTING & REFERENCES
  // ==========================================
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const searchRef = useRef(null); 

  // ==========================================
  // 2. UI & NAVIGATION STATES
  // ==========================================
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // ==========================================
  // 3. BROADCAST STATES
  // ==========================================
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendState, setSendState] = useState('');

  // ==========================================
  // 4. NOTIFICATION STATES
  // ==========================================
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ==========================================
  // 5. SYSTEM & BOARD STATES
  // ==========================================
  const [board, setBoard] = useState({ subject: '', date: '' });
  const [activeBoards, setActiveBoards] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [stats, setStats] = useState({ 
    status: 'Scanning...', 
    db_status: 'Checking...', 
    experts: 0, 
    candidates: 0 
  });

  const adminName = localStorage.getItem('username') || 'System Admin';

  // ==========================================
  // 6. ADMIN NEURAL MATCHING STATES
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [adminMatchResults, setAdminMatchResults] = useState([]);
  const [searchedCandidate, setSearchedCandidate] = useState(null);

  // ==========================================
  // 7. LIVE DATA STATES (VAULT & USERS)
  // ==========================================
  const [vaultLogs, setVaultLogs] = useState([]);
  const [userList, setUserList] = useState([]);

  // ==========================================
  // CLICK-OUTSIDE LISTENER
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef, searchRef]);

  // ==========================================
  // INITIALIZATION & POLLING
  // ==========================================
  useEffect(() => {
    fetchDiagnostics(); 
    fetchNotifications();
    fetchAdminData(); 
    fetchBoards();
    
    const interval = setInterval(() => { 
      fetchDiagnostics(); 
      fetchNotifications(); 
      fetchAdminData(); 
      fetchBoards();
    }, 15000); 
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { 
    localStorage.clear(); 
    navigate('/login'); 
  };

  // ==========================================
  // LIVE DATABASE FETCH LOGIC
  // ==========================================
  const fetchAdminData = async () => {
    try {
      const userRes = await axios.get('http://localhost:5000/api/admin/users');
      setUserList(userRes.data);
      
      const vaultRes = await axios.get('http://localhost:5000/api/admin/vault_logs');
      setVaultLogs(vaultRes.data);
    } catch (err) {
      console.error("Failed to sync live admin data.");
    }
  };

  const fetchDiagnostics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health_check');
      setStats(response.data);
    } catch (error) {
      setStats({ 
        status: 'Critical', 
        db_status: 'Disconnected', 
        experts: 0, 
        candidates: 0 
      });
    }
  };

  const fetchBoards = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/boards');
      setActiveBoards(res.data);
    } catch (error) {
      console.error("Failed to fetch active boards.");
    }
  };

  // ==========================================
  // BOARD INITIALIZATION LOGIC
  // ==========================================
  const createBoard = async () => {
    if (!board.subject || !board.date) {
      alert("Please define Board Subject and Date.");
      return;
    }
    
    setLoadingBoard(true);
    
    try {
      await axios.post('http://localhost:5000/api/create_board', {
        subject: board.subject,
        date: board.date
      });
      
      // Automatically broadcast to the entire network when a board is made
      await axios.post('http://localhost:5000/api/notifications', {
        recipient: 'ALL', 
        sender: `System Admin`, 
        message: `New Interview Board Initialized: ${board.subject} on ${board.date}. Eligible candidates and experts please prepare for sync.`, 
        type: "alert", 
        actionTab: "overview" 
      });

      alert(`Interview Board for '${board.subject}' successfully initialized! Network Notified.`);
      setBoard({ subject: '', date: '' });
      fetchBoards();
    } catch (error) {
      alert('Failed to connect to Database to create board.');
    } finally {
      setLoadingBoard(false);
    }
  };

  // ==========================================
  // NOTIFICATION & MATRIX LOGIC
  // ==========================================
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/notifications/${encodeURIComponent(adminName)}`
      );
      setNotifications(res.data);
    } catch (err) {}
  };

  const markNotificationRead = async (id) => {
    try { 
      await axios.put(`http://localhost:5000/api/notifications/read/${id}`); 
      fetchNotifications(); 
    } catch(err) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBroadcast = async (e) => {
    e.preventDefault(); 
    if (!broadcastMessage) return;
    
    setIsSending(true); 
    setSendState('');
    
    try {
      await axios.post('http://localhost:5000/api/notifications', {
        recipient: broadcastTarget, 
        sender: `Admin: ${adminName}`, 
        message: broadcastMessage, 
        type: "alert", 
        actionTab: "overview" 
      });
      setSendState('Transmission successful.'); 
      setBroadcastMessage('');
    } catch (err) { 
      setSendState('Transmission failed. Check database link.'); 
    } finally { 
      setIsSending(false); 
      setTimeout(() => setSendState(''), 4000); 
    }
  };

  // ==========================================
  // ADMIN NEURAL MATCHING ENGINE LOGIC
  // ==========================================
  const handleAdminNetworkQuery = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 2) {
      setIsSearchOpen(true);
      setIsSearching(true);
      setSearchedCandidate(value);

      try {
        const simulatedCandidateSkills = "Python, Machine Learning, Data Science, AI, React";

        const res = await axios.post('http://localhost:5000/api/match', { 
          username: value, 
          skills: simulatedCandidateSkills 
        });

        if (res.data && res.data.length > 0) {
          const formattedMatches = res.data.slice(0, 3).map(match => ({
             id: match.id || Math.random(), 
             expert_name: match.expert_name || "Verified Expert", 
             domain: match.domain || "Specialist", 
             score: typeof match.score === 'number' ? match.score.toFixed(1) : 90.0
          }));
          setAdminMatchResults(formattedMatches.sort((a, b) => b.score - a.score));
        } else {
          setAdminMatchResults([]);
        }
      } catch (err) {
        console.error("Match Engine Failed during Admin Search.");
        setAdminMatchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setIsSearchOpen(false);
      setAdminMatchResults([]);
      setSearchedCandidate(null);
    }
  };

  const grantInterviewAccess = async (expertName) => {
    if (!searchedCandidate) return;

    try {
      await axios.post('http://localhost:5000/api/notifications', {
        recipient: searchedCandidate, 
        sender: `Admin: ${adminName}`, 
        type: 'alert', 
        actionTab: 'match',
        message: `ROOT ACCESS GRANTED: You have been highly recommended to interview with ${expertName}. Please proceed to your Match Engine tab to initialize sync.`
      });
      
      alert(`Interview recommendation successfully beamed to ${searchedCandidate}.`);
      setIsSearchOpen(false);
      setSearchQuery('');
    } catch (error) {
      alert('Failed to transmit recommendation.');
    }
  };

  // ==========================================
  // SIDEBAR COMPONENT
  // ==========================================
  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        activeTab === id 
        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
        : 'text-slate-400 hover:bg-white/5'
      }`}
    >
      <Icon 
        size={20} 
        className={activeTab === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} 
      />
      <AnimatePresence>
        {isSidebarOpen && ( 
          <motion.span 
            initial={{ opacity: 0, width: 0 }} 
            animate={{ opacity: 1, width: 'auto' }} 
            exit={{ opacity: 0, width: 0 }} 
            className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span> 
        )}
      </AnimatePresence>
    </button>
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden selection:bg-purple-500 font-sans">
      
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[20%] w-[30vw] h-[30vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- SIDEBAR --- */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 100 }} 
        className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 relative z-20 shrink-0"
      >
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute -right-4 top-10 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-110 transition-transform"
        >
          <ChevronLeft 
            size={16} 
            className={!isSidebarOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
          />
        </button>
        
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-purple-500 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center">
              <Terminal className="text-purple-400" size={24} />
            </div>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="text-sm font-black tracking-widest uppercase">
                  Nexus Command
                </h2>
                <p className="text-[9px] text-purple-500 font-bold tracking-[0.2em] uppercase">
                  Root Admin
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <nav className="flex-1 space-y-3">
          <SidebarItem icon={Activity} label="System Status" id="overview" />
          <SidebarItem icon={BellRing} label="Broadcast Node" id="broadcast" />
          <SidebarItem icon={Database} label="Vault Analytics" id="database" />
          <SidebarItem icon={Users} label="User Roles" id="users" />
        </nav>
        
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl shrink-0 group transition-all border border-transparent hover:border-red-500/30"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden"
              >
                Sever Link
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Topbar */}
        <header className="relative z-50 h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="text-lg md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 truncate">
              Root: {adminName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: 
              <span className="text-purple-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span> 
                Override Active
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-6 shrink-0">
            
            {/* NOTIFICATION WIDGET W/ CLICK OUTSIDE */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 group transition-all"
              >
                <Bell size={18} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-[7px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{opacity:0, y:10, scale:0.95}} 
                    animate={{opacity:1,y:0, scale:1}} 
                    exit={{opacity:0,y:10, scale:0.95}} 
                    className="absolute right-0 mt-4 w-80 bg-[#0B1021]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                        Alerts
                      </h3>
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                        {unreadCount} New
                      </span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          No signals detected.
                        </div>
                      ) : notifications.map(n => (
                        <div 
                          key={n._id} 
                          className={`p-4 rounded-xl transition-all cursor-pointer ${
                            n.read 
                            ? 'bg-transparent opacity-50 hover:bg-white/5' 
                            : 'bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20'
                          }`}
                        >
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex justify-between">
                            {n.sender} 
                            <span className="text-slate-500 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                          </p>
                          <p className="text-xs font-medium text-slate-200 leading-snug mb-3">
                            {n.message}
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { 
                                setActiveTab(n.actionTab || 'overview'); 
                                setIsNotifOpen(false); 
                              }} 
                              className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition-all flex items-center gap-1"
                            >
                              View <ArrowRight size={10}/>
                            </button>
                            
                            {!n.read && (
                              <button 
                                onClick={() => markNotificationRead(n._id)} 
                                className="text-[9px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- ADMIN NEURAL SEARCH WIDGET --- */}
            <div className="relative group hidden lg:block" ref={searchRef}>
              <Search 
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearchOpen ? 'text-purple-400' : 'text-slate-500'} transition-colors`} 
                size={16} 
              />
              <input 
                type="text" 
                placeholder="Query Candidate Profile..." 
                value={searchQuery}
                onChange={handleAdminNetworkQuery}
                onFocus={() => searchQuery.length > 0 && setIsSearchOpen(true)}
                className="bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-6 text-xs outline-none focus:border-purple-500/50 w-48 xl:w-72 transition-all focus:w-80 font-medium text-white focus:bg-black/80 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              />
              
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className="absolute right-0 top-full mt-4 w-96 bg-[#0B1021]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Neural Matching Engine
                      </h3>
                      {isSearching && (
                        <div className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      )}
                    </div>
                    
                    <div className="p-2 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {isSearching ? (
                        <div className="p-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                          Scanning candidate vectors...
                        </div>
                      ) : adminMatchResults.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-[9px] text-purple-400 font-black uppercase tracking-widest bg-purple-500/10 rounded-lg mx-2 my-2 border border-purple-500/20">
                            Candidate Found: {searchedCandidate}. Recommended Experts:
                          </div>
                          
                          {adminMatchResults.map((match, i) => (
                            <div 
                              key={match.id} 
                              className="p-4 bg-black/40 rounded-xl border border-white/5 mx-2 mb-2 hover:border-purple-500/30 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Zap size={12} className="text-purple-400" /> {match.expert_name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    Domain: {match.domain}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Score</p>
                                  <p className="text-sm font-black text-purple-400">{match.score}%</p>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => grantInterviewAccess(match.expert_name)}
                                className="w-full py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-purple-500/30"
                              >
                                Grant Interview Access
                              </button>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-6 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          Type a candidate name to run Match Engine.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center animate-pulse shrink-0">
              <ShieldCheck className="text-purple-400" size={18} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB: SYSTEM STATUS & BOARD INITIALIZATION */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                className="max-w-7xl mx-auto space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Column 1: Initialize Board Form */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-xl">
                    <Plus className="text-purple-400 mb-6" size={32} />
                    <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6">
                      Initialize Board
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Interview Domain
                        </label>
                        <input 
                          type="text"
                          value={board.subject}
                          placeholder="e.g. Artificial Intelligence" 
                          className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500/50 mt-2 transition-all text-sm font-medium text-white"
                          onChange={(e) => setBoard({...board, subject: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Session Date
                        </label>
                        <input 
                          type="date" 
                          value={board.date}
                          className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500/50 mt-2 transition-all text-sm font-medium text-slate-300"
                          onChange={(e) => setBoard({...board, date: e.target.value})}
                        />
                      </div>
                      
                      <button 
                        onClick={createBoard} 
                        disabled={loadingBoard}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-purple-900/30 active:scale-[0.98]"
                      >
                        {loadingBoard ? "DEPLOYING..." : "DEPLOY INTERVIEW BOARD"}
                      </button>
                    </div>
                  </div>

                  {/* Column 2 & 3: Diagnostics & Data Metrics */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Health Status */}
                      <div className={`p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10 ${stats.status === 'Optimal' ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                        <Activity className={stats.status === 'Optimal' ? 'text-emerald-400 mb-4' : 'text-red-400 mb-4'} size={32} />
                        <h3 className="text-lg font-black uppercase tracking-widest">
                          System Health
                        </h3>
                        <p className={`text-4xl font-black tracking-tighter mt-2 ${stats.status === 'Optimal' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stats.status}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">
                          Flask API Connectivity
                        </p>
                      </div>

                      {/* Database Status */}
                      <div className={`p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10 ${stats.db_status === 'Connected' ? 'bg-blue-500/5' : 'bg-red-500/5'}`}>
                        <Server className={stats.db_status === 'Connected' ? 'text-blue-400 mb-4' : 'text-red-400 mb-4'} size={32} />
                        <h3 className="text-lg font-black uppercase tracking-widest">
                          Database Status
                        </h3>
                        <p className={`text-4xl font-black tracking-tighter mt-2 ${stats.db_status === 'Connected' ? 'text-blue-400' : 'text-red-400'}`}>
                          {stats.db_status}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">
                          MongoDB GridFS & Vectors
                        </p>
                      </div>
                    </div>

                    {/* User Metrics & Logs */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                          <Database className="text-blue-400" size={24} /> Neural Access Logs
                        </h3>
                        
                        <div className="flex gap-6">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Experts
                            </p>
                            <p className="text-2xl font-black text-white">
                              {stats.experts}
                            </p>
                          </div>
                          <div className="text-left md:text-right border-l border-white/10 pl-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Candidates
                            </p>
                            <p className="text-2xl font-black text-white">
                              {stats.candidates}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-slate-400">
                          [SYSTEM] Secure handshake established with MongoDB Cluster...
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-emerald-400/80">
                          [SUCCESS] Data diagnostics fetch: {stats.experts} experts synced.
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-purple-400/80">
                          [AUTH] Root level override active. Ready for broadcast.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- NEW: ACTIVE INTERVIEW BOARDS UI --- */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                  <h2 className="text-xl font-black uppercase tracking-widest text-purple-400 mb-6">
                    Active Interview Boards
                  </h2>
                  
                  {activeBoards.length === 0 ? (
                    <div className="text-center p-10 border border-dashed border-white/10 rounded-2xl text-slate-500 font-bold uppercase text-xs tracking-widest">
                      No active boards found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeBoards.map(board => (
                        <div key={board._id} className="bg-black/40 border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center shadow-inner">
                              <Video className="text-purple-400" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-black tracking-wider uppercase text-white">
                                {board.boardSubject}
                              </h3>
                              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">
                                Scheduled Date: <span className="text-purple-400">{board.boardDate}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-pulse">
                              {board.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* BROADCAST TAB */}
            {activeTab === 'broadcast' && (
              <motion.div 
                key="broadcast" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="max-w-4xl mx-auto mt-10"
              >
                <div className="mb-8 text-center">
                  <BellRing size={48} className="mx-auto mb-6 text-purple-400" />
                  <h2 className="text-3xl font-black uppercase tracking-widest text-white">
                    Command Broadcast
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-2">
                    Transmit overriding alerts to the global Notification Matrix or specific nodes.
                  </p>
                </div>
                
                <form onSubmit={handleBroadcast} className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl backdrop-blur-md">
                  <div className="mb-8">
                    <label className="block text-[10px] font-black mb-3 uppercase text-slate-500 tracking-widest ml-2">
                      Target Node (Type 'ALL' or Username)
                    </label>
                    <input 
                      type="text" 
                      value={broadcastTarget} 
                      onChange={(e) => setBroadcastTarget(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-purple-500/50 transition-colors text-white font-medium uppercase tracking-wider" 
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-[10px] font-black mb-3 uppercase text-slate-500 tracking-widest ml-2">
                      Transmission Data
                    </label>
                    <textarea 
                      value={broadcastMessage} 
                      onChange={(e) => setBroadcastMessage(e.target.value)} 
                      placeholder="Enter system alert or interview override notification here..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-purple-500/50 min-h-[150px] transition-colors text-white font-medium resize-y custom-scrollbar" 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={!broadcastMessage || isSending} 
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xs tracking-[0.3em] uppercase rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isSending ? "TRANSMITTING..." : "FIRE BROADCAST"} <Send size={16} />
                  </button>
                  
                  {sendState && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className={`text-center text-xs font-black uppercase tracking-widest mt-6 ${sendState.includes('failed') ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {sendState}
                    </motion.p>
                  )}
                </form>
              </motion.div>
            )}

            {/* VAULT ANALYTICS TAB */}
            {activeTab === 'database' && (
              <motion.div 
                key="database" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="max-w-7xl mx-auto space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-blue-400 flex items-center gap-3">
                      <HardDrive size={28} /> Global Vault Analytics
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-2">
                      System-wide metrics for encrypted file storage and candidate node resumes.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Storage</p>
                      <p className="text-2xl font-black text-white">45.2 GB</p>
                    </div>
                    <div className="text-right border-l border-white/10 pl-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Links</p>
                      <p className="text-2xl font-black text-emerald-400 flex items-center gap-1"><CloudRain size={16} /> 1,248</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                    Recent Encrypted Uploads
                  </h3>
                  
                  <div className="space-y-4">
                    {vaultLogs.length === 0 ? (
                      <div className="text-center p-10 border border-dashed border-white/10 rounded-2xl text-slate-500 font-bold uppercase text-xs">
                        No vault logs detected in the database.
                      </div>
                    ) : vaultLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/30 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-xl">
                            <FileText size={16} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white tracking-wider">
                              {log.file}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                              Origin: <span className="text-slate-300">{log.user}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden md:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Size</p>
                            <p className="text-xs font-bold text-slate-300">{log.size}</p>
                          </div>
                          <div className="text-right hidden md:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Classification</p>
                            <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase bg-purple-500/10 px-2 py-1 rounded">
                              {log.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Timestamp</p>
                            <p className="text-xs font-bold text-emerald-400">{log.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <motion.div 
                key="users" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="max-w-7xl mx-auto space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-purple-400 flex items-center gap-3">
                      <UserCog size={28} /> Access Control
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-2">
                      Manage root permissions and monitor active node connections.
                    </p>
                  </div>
                  
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filter nodes..." 
                      className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-6 text-xs outline-none focus:border-purple-500/50 transition-all font-medium text-white"
                    />
                  </div>
                </div>

                {userList.length === 0 ? (
                  <div className="text-center p-20 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] text-slate-500 font-bold uppercase tracking-widest">
                    No active users found in database.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userList.map((u) => (
                      <div 
                        key={u.id} 
                        className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md hover:bg-white/10 transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center shadow-inner">
                              <span className="font-black text-lg text-slate-400 group-hover:text-purple-400 transition-colors">
                                {u.name.charAt(0)}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border ${
                              u.status === 'Active' || u.status === 'Online' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-slate-800/50 text-slate-500 border-white/5'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' || u.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                              {u.status}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-black uppercase tracking-widest text-white mb-1 truncate">
                            {u.name}
                          </h3>
                          <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${
                            u.role === 'Root Admin' ? 'text-purple-400' : u.role === 'Expert' ? 'text-cyan-400' : 'text-blue-400'
                          }`}>
                            {u.role} Node
                          </p>
                        </div>
                        
                        <div className="border-t border-white/5 pt-6 mt-auto">
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Date Created</p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{u.lastLogin}</p>
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="flex-1 py-2.5 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-purple-500/30 flex items-center justify-center gap-2">
                              <Settings size={12} /> Edit Clearance
                            </button>
                            <button className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20" title="Revoke Link">
                              <Lock size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;