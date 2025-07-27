import { Award, Shield, Star } from 'lucide-react';

export function RoyalCollegeBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
      <div className="relative group">
        {/* Enhanced glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/20 via-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
        
        {/* Main badge with modern glass morphism */}
        <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-8 py-5 hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
          
          {/* Decorative top border */}
          <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 rounded-full"></div>
          
          {/* Header with icons */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-blue-600" />
              <Star className="w-4 h-4 text-teal-500" />
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          
          {/* Badge content */}
          <div className="text-center space-y-2">
            {/* Main title */}
            <div className="text-slate-800 font-bold text-sm tracking-wide">
              ROYAL COLLEGE OF SURGEONS
            </div>
            
            {/* Location */}
            <div className="text-slate-600 text-xs font-medium">
              Newcastle upon Tyne
            </div>
            
            {/* Award status */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-2 rounded-full border border-teal-200/50">
              <Star className="w-3 h-3 text-teal-600" />
              <span className="text-teal-700 font-semibold text-xs">FINALIST 2025</span>
            </div>
            
            {/* Description */}
            <div className="text-slate-500 text-xs leading-relaxed">
              Outstanding Contribution to Dentistry<br/>
              <span className="text-blue-600 font-medium">DentConnect Innovation</span>
            </div>
          </div>
          
          {/* Bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
}