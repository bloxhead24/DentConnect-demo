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
        <div className="relative mx-auto flex items-center justify-center">
          {/* Main treatment circle */}
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg",
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
          </div>
          
          {/* Small decorative icons around the circle */}
          {treatment.category === 'emergency' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-plus text-red-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-red-600 text-xs"></i>
              </div>
            </>
          )}
          {treatment.category === 'urgent' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="fas fa-procedures text-orange-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="fas fa-fill-drip text-orange-600 text-xs"></i>
              </div>
            </>
          )}
          {treatment.category === 'routine' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-broom text-green-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-search text-green-600 text-xs"></i>
              </div>
            </>
          )}
          {treatment.category === 'cosmetic' && (
            <>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-sparkles text-blue-600 text-xs"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-smile text-blue-600 text-xs"></i>
              </div>
            </>
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
