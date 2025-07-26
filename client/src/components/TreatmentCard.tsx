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
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto shadow-lg relative",
          selected ? "bg-primary" : bgClasses[treatment.category]
        )}>
          {/* Category-specific dental icons */}
          {treatment.category === 'emergency' && (
            <i className="fas fa-exclamation-triangle text-white text-sm sm:text-lg"></i>
          )}
          {treatment.category === 'urgent' && (
            <i className="fas fa-tooth text-white text-sm sm:text-lg"></i>
          )}
          {treatment.category === 'routine' && (
            <i className="fas fa-stethoscope text-white text-sm sm:text-lg"></i>
          )}
          {treatment.category === 'cosmetic' && (
            <i className="fas fa-star text-white text-sm sm:text-lg"></i>
          )}
          
          {/* Small dental icon overlay for context */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
            <i className="fas fa-tooth text-gray-600 text-xs"></i>
          </div>
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
