import { Award } from 'lucide-react';

export function RoyalCollegeBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
      <div className="relative">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-indigo-800 to-blue-800 rounded-lg blur-sm opacity-20"></div>
        
        {/* Main professional badge */}
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 backdrop-blur-sm text-white px-6 py-3 shadow-xl border border-slate-600/30 rounded-lg">
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          
          {/* Badge content */}
          <div className="flex items-center space-x-3">
            {/* Award icon */}
            <div className="flex-shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            
            {/* Text content */}
            <div className="text-left">
              <div className="text-amber-400 font-semibold text-xs tracking-wide uppercase">
                Royal College of Surgeons
              </div>
              <div className="text-slate-300 text-[10px] font-medium">
                DentConnect Newcastle • Finalist 2025 • Outstanding Contribution to Dentistry
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}