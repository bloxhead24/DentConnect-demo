import { Badge } from './ui/badge';
import { Award, Crown, Star, Shield } from 'lucide-react';

export function RoyalCollegeBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
      <div className="relative">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-full blur-lg opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Premium border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 rounded-xl p-0.5 opacity-90">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-xl h-full w-full"></div>
        </div>
        
        {/* Main badge */}
        <div className="relative bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 backdrop-blur-md text-white px-8 py-4 shadow-2xl hover:shadow-purple-500/30 transition-all duration-700 hover:scale-105 border-2 border-yellow-400/50 rounded-xl royal-badge">
          {/* Royal crest background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent rounded-xl animate-shimmer"></div>
          
          {/* Royal elements header */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-300 animate-bounce drop-shadow-lg" style={{ animationDelay: '0s' }} />
            <Shield className="w-4 h-4 text-yellow-200 animate-pulse" />
            <Star className="w-4 h-4 text-yellow-200 animate-ping" style={{ animationDelay: '0.3s' }} />
            <Award className="w-5 h-5 text-yellow-300 animate-bounce drop-shadow-lg" style={{ animationDelay: '0.6s' }} />
          </div>
          
          {/* Badge content */}
          <div className="text-center space-y-1">
            <div className="font-bold text-yellow-200 tracking-widest text-xs uppercase drop-shadow-md">
              Royal College of Surgeons
            </div>
            <div className="text-[10px] text-purple-100 font-semibold tracking-wide">
              Edinburgh • London • Ireland • Glasgow
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent font-black text-xs tracking-wide drop-shadow-sm">
              🏆 FINALIST 2025 🏆
            </div>
            <div className="text-[10px] text-white font-medium">
              DentConnect - Outstanding Contribution to Dentistry
            </div>
          </div>
        </div>
        
        {/* Floating sparkles */}
        <div className="absolute -top-3 -right-3 animate-float">
          <Star className="w-4 h-4 text-yellow-400 animate-spin drop-shadow-lg" style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute -bottom-2 -left-3 animate-float-delayed">
          <Star className="w-3 h-3 text-purple-300 animate-pulse drop-shadow-lg" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-float-slow">
          <Crown className="w-3 h-3 text-yellow-300 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}