import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  LogOut, 
  ShieldCheck, 
  Activity, 
  Users, 
  FileText, 
  Monitor,
  Bell,
  Search
} from 'lucide-react';

/**
 * DashboardLayout Component
 * A highly reusable, fully responsive layout wrapper that perfectly matches 
 * the AEGIS V2 / Nexus RAC aesthetic. Use this to wrap any custom internal pages.
 * * Props:
 * - children: The main content to render inside the layout.
 * - activeTab: The currently active tab string (e.g., 'overview').
 * - setActiveTab: Function to update the active tab.
 * - menuItems: Array of objects { id, label, icon } for the sidebar navigation.
 * - userName: String to display in the header.
 * - userRole: String to display under the logo (e.g., 'System Admin').
 */
const DashboardLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  menuItems,
  userName = "Verified User",
  userRole = "Access Node"
}) => {

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Default menu items if none are passed in via props
  const defaultMenu = menuItems || [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'match', label: 'Match Engine', icon: Users },
    { id: 'vault', label: 'Data Vault', icon: FileText },
    { id: 'logs', label: 'System Logs', icon: Monitor }
  ];

  // ==========================================
  // REUSABLE SIDEBAR BUTTON COMPONENT
  // ==========================================
  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab && setActiveTab(id)} 
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        activeTab === id 
        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
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
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- SIDEBAR NAVIGATION --- */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 100 }} 
        className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 relative z-20 shrink-0"
      >
        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute -right-4 top-10 w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform"
        >
          <ChevronLeft 
            size={16} 
            className={!isSidebarOpen ? 'rotate-180 transition-transform' : 'transition-transform'} 
          />
        </button>
        
        {/* Logo & Branding */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={24} />
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
                <p className="text-[9px] text-cyan-500 font-bold tracking-[0.2em] uppercase">
                  {userRole}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 space-y-3">
          {defaultMenu.map((item) => (
            <SidebarItem key={item.id} icon={item.icon} label={item.label} id={item.id} />
          ))}
        </nav>
        
        {/* Terminate Session Button */}
        <button 
          onClick={() => console.log("Logout triggered")} 
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group mt-4 shrink-0"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="font-bold text-xs uppercase tracking-widest overflow-hidden whitespace-nowrap"
              >
                Terminate Session
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Top Header Bar */}
        <header className="relative z-50 h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          
          {/* Identify Section with robust text truncation */}
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="text-lg md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 truncate">
              Identify: <span className="text-white">{userName}</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: 
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 
                Connected
              </span>
            </p>
          </div>
          
          {/* Header Action Tools */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            
            <button className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group">
              <Bell size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
            </button>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Query system..." 
                className="bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-6 text-xs outline-none focus:border-cyan-500/50 w-48 xl:w-64 transition-all focus:w-72 xl:focus:w-80 font-medium text-white focus:bg-black/80 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              />
            </div>
            
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-pulse shrink-0">
              <ShieldCheck className="text-cyan-400" size={18} />
            </div>
          </div>
        </header>

        {/* --- SCROLLABLE CONTENT INJECTION --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Forces framer-motion to animate when the tab string changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;