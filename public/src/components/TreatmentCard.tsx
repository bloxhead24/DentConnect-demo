import { TreatmentType } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        "treatment-card p-5 cursor-pointer border-2 transition-all duration-300 transform hover:scale-105",
        "hover:shadow-xl",
        selected ? "border-primary bg-gradient-to-br from-primary/10 to-primary/20 shadow-xl shadow-primary/20 scale-105" : "border-transparent hover:border-primary/30",
        colorClasses[treatment.category]
      )}
      onClick={() => onSelect(treatment)}
    >
      <div className="text-center space-y-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-lg",
          selected ? "bg-primary" : bgClasses[treatment.category]
        )}>
          <i className={`${treatment.icon} text-white text-lg`}></i>
        </div>
        <div>
          <h4 className={`font-bold ${selected ? 'text-primary' : 'text-gray-900'}`}>
            {treatment.name}
          </h4>
          <p className={`text-xs ${selected ? 'text-primary/80' : 'text-gray-600'}`}>
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
