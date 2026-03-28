import React from 'react';
import { ArrowRight } from 'lucide-react';

export function WordsOnly() {
  return (
    <div className="min-h-screen bg-[#111c12] flex flex-col items-center justify-between text-white font-sans w-full max-w-[390px] mx-auto overflow-hidden relative shadow-2xl">
      {/* Top Progress Bar */}
      <div className="w-full px-8 pt-16 pb-4 z-10">
        <div className="flex gap-2">
          <div className="h-0.5 flex-1 bg-white/80 rounded-full" />
          <div className="h-0.5 flex-1 bg-white/20 rounded-full" />
          <div className="h-0.5 flex-1 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-8 flex flex-col justify-center -mt-16 z-10">
        <h1 className="font-['Playfair_Display'] text-7xl sm:text-8xl font-bold leading-[0.9] tracking-tighter mb-4 text-[#F3EFE0]">
          Become.
        </h1>
        <h2 className="text-2xl sm:text-3xl font-medium leading-snug tracking-tight text-[#D3CFC0] mb-12 max-w-[280px]">
          someone who's good with money
        </h2>
        
        <p className="text-lg text-[#9BA89E] font-light tracking-wide leading-relaxed">
          No spreadsheets.
          <br />
          No guilt.
          <br />
          Just clarity.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="w-full px-8 pb-12 pt-8 z-10">
        <button 
          onClick={() => console.log('Lets go clicked')}
          className="w-full bg-[#F3EFE0] text-[#111c12] rounded-full py-4 text-lg font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-[0.98] shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
        >
          Let's go
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Subtle background texture/gradient overlay to add depth without being a visible shape */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111c12]/50 to-[#0a110b] pointer-events-none"></div>
    </div>
  );
}
