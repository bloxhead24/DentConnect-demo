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
        "treatment-card p-4 cursor-pointer border-2 transition-all duration-300",
        "hover:shadow-gentle",
        selected ? "border-primary" : "border-transparent",
        colorClasses[treatment.category]
      )}
      onClick={() => onSelect(treatment)}
    >
      <div className="text-center space-y-2">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto", bgClasses[treatment.category])}>
          <i className={`${treatment.icon} text-white text-sm`}></i>
        </div>
        <h4 className="font-medium text-text-primary">{treatment.name}</h4>
        <p className="text-xs text-text-soft">{treatment.description}</p>
      </div>
    </Card>
  );
}
