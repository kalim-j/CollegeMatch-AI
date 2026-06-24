export default function FirstGenPage() {
  return (
    <div className="bg-white dark:bg-[#05071a] min-h-screen pt-32 pb-24 px-4 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-[#1a1340] dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F77DD] to-[#1D9E75]">First-Gen</span> Student
        </h1>
        <p className="text-[#5a5380] dark:text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-16">
          A dedicated guide and scholarship repository for first-generation college students.
        </p>

        <div className="bg-[#f0eeff] dark:bg-[rgba(255,255,255,0.03)] border border-[rgba(127,119,221,0.2)] dark:border-[rgba(255,255,255,0.1)] backdrop-blur-xl rounded-3xl p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
             <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
               Coming Soon
             </span>
          </div>
          <div className="w-20 h-20 mx-auto bg-[rgba(127,119,221,0.1)] dark:bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-[rgba(127,119,221,0.2)] dark:border-white/10 group-hover:scale-110 transition-transform duration-500">
            <span className="text-4xl">🌟</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1340] dark:text-white mb-4">Under Development</h2>
          <p className="text-[#5a5380] dark:text-white/40">
            Our research team is currently compiling the latest data and regulations for the 2026 admissions cycle.
            Check back in a few weeks!
          </p>
        </div>
      </div>
    </div>
  );
}
