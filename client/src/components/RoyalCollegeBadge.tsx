import { Badge } from './ui/badge';
import { Award } from 'lucide-react';

export function RoyalCollegeBadge() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
      <Badge className="bg-amber-500/95 backdrop-blur-md text-white text-xs px-4 py-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <Award className="w-3 h-3 mr-2" />
        DentConnect - Royal College of Surgeons Finalist for Outstanding Contribution to Dentistry
      </Badge>
    </div>
  );
}