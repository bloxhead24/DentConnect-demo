import { Award } from 'lucide-react';

export function RoyalCollegeBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000 hover:translate-x-[45vw] transition-all duration-500 ease-in-out">
      <div className="relative group">
        {/* Subtle glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-400/10 via-blue-500/10 to-teal-400/10 rounded-xl blur-md opacity-40 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        {/* Main minimal badge */}
        <div className="relative bg-white/90 backdrop-blur-sm border border-teal-200/30 shadow-lg rounded-xl px-6 py-4 hover:shadow-xl transition-all duration-300">
          
          {/* Top accent line */}
          <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
          
          {/* Badge content */}
          <div className="flex items-center space-x-3">
            {/* Single award icon */}
            <Award className="w-4 h-4 text-teal-600 flex-shrink-0" />
            
            {/* Text content */}
            <div className="text-left">
              <div className="text-slate-800 font-semibold text-xs tracking-wide">
                Royal College of Surgeons
              </div>
              <div className="text-slate-500 text-[10px] font-medium leading-tight">
                Newcastle • Finalist 2025 • Outstanding Contribution
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}