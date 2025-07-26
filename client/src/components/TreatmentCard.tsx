import { TreatmentType } from "../lib/types";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";

interface TreatmentCardProps {
  treatment: TreatmentType;
  selected: boolean;
  onSelect: (treatment: TreatmentType) => void;
}

export function TreatmentCard({ treatment, selected, onSelect }: TreatmentCardProps) {
  const colorClasses = {
    emergency: "hover:border-red-500",
    urgent: "hover:border-orange-500",
    routine: "hover:border-green-500",
    cosmetic: "hover:border-blue-500",
  };

  const bgClasses = {
    emergency: "bg-red-500",
    urgent: "bg-orange-500",
    routine: "bg-green-500",
    cosmetic: "bg-blue-500",
  };

  return (
    <Card
      className={cn(
        "treatment-card p-4 sm:p-5 cursor-pointer border-2 transition-all duration-300 transform hover:scale-105",
        "hover:shadow-xl touch-friendly min-h-[120px] sm:min-h-[140px]",
        selected ? "border-primary bg-gradient-to-br from-primary/10 to-primary/20 shadow-xl shadow-primary/20 scale-105" : "border-transparent hover:border-primary/30",
        colorClasses[treatment.category]
      )}
      onClick={() => onSelect(treatment)}
    >
      <div className="text-center space-y-3 h-full flex flex-col justify-center">
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 transition-all duration-300",
          selected 
            ? "bg-primary border-primary scale-110 ring-4 ring-primary/30" 
            : "bg-white border-gray-200 hover:border-primary/50",
          treatment.category === 'emergency' && !selected && "border-red-300 hover:border-red-500",
          treatment.category === 'urgent' && !selected && "border-orange-300 hover:border-orange-500",
          treatment.category === 'routine' && !selected && "border-green-300 hover:border-green-500",
          treatment.category === 'cosmetic' && !selected && "border-blue-300 hover:border-blue-500"
        )}>
          {/* Treatment category specific SVG images */}
          {treatment.category === 'emergency' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-red-600")} fill="currentColor">
              <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          )}
          {treatment.category === 'urgent' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-orange-600")} fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.5 6L12 8.5 14.5 6 16 7.5 13.5 10 16 12.5 14.5 14 12 11.5 9.5 14 8 12.5 10.5 10 8 7.5 9.5 6z"/>
            </svg>
          )}
          {treatment.category === 'routine' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-green-600")} fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          )}
          {treatment.category === 'cosmetic' && (
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 sm:w-6 sm:h-6", selected ? "text-white" : "text-blue-600")} fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}
        </div>
        <div>
          <h4 className={`font-bold responsive-body ${selected ? 'text-primary' : 'text-gray-900'}`}>
            {treatment.name}
          </h4>
          <p className={`text-xs sm:text-sm ${selected ? 'text-primary/80' : 'text-gray-600'}`}>
            {treatment.description}
          </p>
        </div>
        {selected && (
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </Card>
  );
}
