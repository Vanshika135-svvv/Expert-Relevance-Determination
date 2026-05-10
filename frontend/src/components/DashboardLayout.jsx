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
  Search,
  Menu, // Added for mobile
  X     // Added for mobile
} from 'lucide-react';

/**
 * DashboardLayout Component (MOBILE RESPONSIVE UPGRADE)
 * A highly reusable, fully responsive layout wrapper that perfectly matches 
 * the AEGIS V2 / Aegis RAC aesthetic.
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
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const SidebarItem = ({ icon: Icon, label, id, isMobileView }) => {
    // Show text if we are on mobile, OR if the desktop sidebar is expanded
    const showText = isMobileView || isDesktopSidebarOpen;

    return (
      <button 
        onClick={() => {
          if (setActiveTab) setActiveTab(id);
          if (isMobileView) setIsMobileMenuOpen(false); // Auto-close menu on mobile tap
        }} 
        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
          activeTab === id 
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
        }`}
      >
        <Icon 
          size={20} 
          className={activeTab === id ? 'animate-pulse shrink-0' : 'group-hover:scale-110 transition-transform shrink-0'} 
        />
        <AnimatePresence>
          {showText && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }} 
              animate={{ opacity: 1, width: 'auto' }} 
              exit={{ opacity: 0, width: 0 }} 
              className="font-bold text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden text-left flex-1"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  };

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    // Changed to flex-col on mobile, flex-row on desktop
    <div className="h-screen bg-[#020617] text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-cyan-500 selection:text-black relative">
      
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] md:w-[40vw] h-[80vw] md:h-[40vw] bg-cyan-600/10 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[60vw] md:w-[30vw] h-[60vw] md:h-[30vw] bg-blue-600/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* --- 📱 MOBILE TOP NAV BAR --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black/40 backdrop-blur-2xl border-b border-white/10 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center">
              <ShieldCheck className="text-cyan-400" size={20} />
            </div>
          </div>
          <div>
            <h1 className="font-bold uppercase tracking-widest text-sm leading-tight">Aegis Command</h1>
            <p className="text-[9px] text-cyan-500 font-bold tracking-[0.2em] uppercase">{userRole}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 border border-white/10 rounded-lg text-cyan-400 hover:bg-white/10 transition"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- 📱 MOBILE DROPDOWN MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-[73px] left-0 w-full z-40 bg-[#020617]/95 backdrop-blur-3xl border-b border-white/10 overflow-hidden shadow-2xl"
          >
            <nav className="p-4 flex flex-col gap-2">
              {defaultMenu.map((item) => (
                <SidebarItem key={item.id} icon={item.icon} label={item.label} id={item.id} isMobileView={true} />
              ))}
              <button 
                onClick={() => console.log("Logout triggered")} 
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all mt-2"
              >
                <LogOut size={20} />
                <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>


      {/* --- 💻 DESKTOP SIDEBAR NAVIGATION --- */}
      <motion.aside 
        animate={{ width: isDesktopSidebarOpen ? 280 : 100 }} 
        className="hidden md:flex h-screen bg-black/40 backdrop-blur-2xl border-r border-white/10 flex-col p-6 relative z-20 shrink-0"
      >
        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} 
          className="absolute -right-4 top-10 w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-110 transition-transform"
        >
          <ChevronLeft 
            size={16} 
            className={!isDesktopSidebarOpen ? 'rotate-180 transition-transform' : 'transition-transform'} 
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
            {isDesktopSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="text-sm font-black tracking-widest uppercase">
                  Aegis Command
                </h2>
                <p className="text-[9px] text-cyan-500 font-bold tracking-[0.2em] uppercase">
                  {userRole}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
          {defaultMenu.map((item) => (
            <SidebarItem key={item.id} icon={item.icon} label={item.label} id={item.id} isMobileView={false} />
          ))}
        </nav>
        
        {/* Terminate Session Button */}
        <button 
          onClick={() => console.log("Logout triggered")} 
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group mt-4 shrink-0"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
          <AnimatePresence>
            {isDesktopSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="font-bold text-xs uppercase tracking-widest overflow-hidden whitespace-nowrap text-left"
              >
                Terminate Session
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* --- 📄 MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-transparent">
        
        {/* Identify Header Bar (Responsive) */}
        <header className="relative z-30 p-4 md:h-24 md:px-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md shrink-0">
          
          {/* Identify Section with robust text truncation */}
          <div className="min-w-0 flex-1 pr-4">
            <h1 className="text-base md:text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 truncate">
              Identify: <span className="text-white">{userName}</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              Status: 
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span> 
                Connected
              </span>
            </p>
          </div>
          
          {/* Header Action Tools (Hidden on mobile to save space) */}
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
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab} // Forces framer-motion to animate when the tab string changes
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-7xl mx-auto pb-24 md:pb-0" // Extra padding on bottom for mobile so chatbot doesn't cover content
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