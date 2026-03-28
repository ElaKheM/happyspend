import React from "react";
import { Sparkles } from "lucide-react";

export function PersonaPeek() {
  const personas = [
    {
      id: "steady",
      emoji: "🏗️",
      name: "The Steady Builder",
      tagline: "Calm, consistent, no drama.",
      color: "bg-blue-50 text-blue-900 border-blue-100",
    },
    {
      id: "intentional",
      emoji: "🎯",
      name: "The Intentional Spender",
      tagline: "Live fully. Spend deliberately.",
      color: "bg-orange-50 text-orange-900 border-orange-100",
    },
    {
      id: "freedom",
      emoji: "🌅",
      name: "The Freedom Seeker",
      tagline: "Budgeting is the price of the life you want.",
      color: "bg-teal-50 text-teal-900 border-teal-100",
    },
    {
      id: "debt",
      emoji: "⚔️",
      name: "The Debt Slayer",
      tagline: "Focused. Strategic. Temporary.",
      color: "bg-rose-50 text-rose-900 border-rose-100",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#fdfaf5] flex flex-col justify-between font-sans selection:bg-stone-200 overflow-hidden relative">
      {/* Background blobs for depth */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-stone-100/80 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-stone-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 -right-32 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-full max-w-[390px] mx-auto w-full px-6 pt-12 pb-8">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="h-1 w-8 rounded-full bg-stone-800" />
          <div className="h-1 w-8 rounded-full bg-stone-200" />
          <div className="h-1 w-8 rounded-full bg-stone-200" />
        </div>

        {/* Hero Section: The Cards Preview */}
        <div className="flex-1 flex flex-col justify-center mb-8">
          <div className="flex items-center justify-center gap-1.5 mb-6 text-stone-500 text-xs font-medium uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4 paths to choose from</span>
          </div>

          <div className="grid grid-cols-2 gap-3 relative">
            {/* Soft white underlay behind the grid to group it */}
            <div className="absolute -inset-4 bg-white/40 rounded-[2rem] backdrop-blur-sm -z-10 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]" />
            
            {personas.map((p, i) => (
              <div 
                key={p.id}
                className={`
                  p-4 rounded-2xl border ${p.color} 
                  opacity-85 backdrop-blur-md 
                  transform transition-all duration-500
                  ${i % 2 === 0 ? 'translate-y-2' : '-translate-y-2'}
                  shadow-sm flex flex-col h-full
                `}
              >
                <div className="text-2xl mb-3 bg-white/60 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-white/50">{p.emoji}</div>
                <h3 className="font-semibold text-[15px] leading-tight mb-1.5 tracking-tight">{p.name}</h3>
                <p className="text-[11px] leading-snug opacity-75 font-medium">{p.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto flex flex-col gap-8">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 leading-[1.1]">
              Who do you want to become?
            </h1>
            <p className="text-stone-500 text-[15px] leading-relaxed max-w-[280px] mx-auto">
              Choose a financial identity. Build habits around it.
            </p>
          </div>

          <button 
            type="button"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-2xl py-4 font-semibold text-lg transition-all active:scale-[0.98] shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)]"
          >
            Let's find out
          </button>
        </div>

      </div>
    </div>
  );
}

export default PersonaPeek;