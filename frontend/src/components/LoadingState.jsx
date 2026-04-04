const LoadingState = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 w-full rounded-2xl bg-white/5 border border-white/10 flex items-center p-6 space-x-4">
          <div className="h-12 w-12 rounded-full bg-white/10" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-1/4 bg-white/10 rounded" />
            <div className="h-2 w-full bg-white/10 rounded" />
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-10">
        {/* Glowing Cyan Spinner */}
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
      </div>
    </div>
  );
};