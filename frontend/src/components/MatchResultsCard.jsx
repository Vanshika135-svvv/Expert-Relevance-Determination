import React from 'react';
import { motion } from 'framer-motion';

const MatchResultsCard = ({ experts }) => {
  // Safety check: if no experts are passed, don't crash, just show nothing or a fallback
  if (!experts || experts.length === 0) {
    return <div className="text-slate-400 italic p-4 bg-white/5 rounded-xl border border-white/10 text-sm">No expert matches available at this time.</div>;
  }

  return (
    // Adjusted gap for mobile vs desktop
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      {experts.map((expert, index) => (
        <motion.div
          key={expert.id || index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          // Added slightly smaller padding on mobile (p-5) to save space, returns to p-6 on desktop
          className="bg-white/5 border border-white/10 backdrop-blur-md shadow-xl p-5 md:p-6 rounded-2xl hover:border-cyan-500/50 transition-colors group"
        >
          {/* flex-col on mobile stacks the text on top of the progress bar. md:flex-row puts them side-by-side */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-4">
            
            {/* Left Side: Expert Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                {expert.expert_name}
              </h3>
              
              {/* flex-wrap ensures long titles don't push off the edge of a phone screen */}
              <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
                <span className="px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                  {expert.domain}
                </span>
                <span className="text-slate-400 text-xs md:text-sm whitespace-nowrap">
                  {expert.experience} Yrs Experience
                </span>
              </div>
            </div>

            {/* Right Side: Relevancy Score & Progress Bar */}
            <div className="w-full md:w-64 shrink-0 bg-black/20 p-3 md:p-0 md:bg-transparent rounded-xl md:rounded-none">
              <div className="flex justify-between mb-2 text-[10px] md:text-xs uppercase tracking-wider text-slate-400">
                <span>Relevancy Score</span>
                <span className="text-cyan-400 font-bold">{expert.score}%</span>
              </div>
              
              {/* Animated Progress Bar Background */}
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                {/* The actual moving bar */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${expert.score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
              </div>
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MatchResultsCard;