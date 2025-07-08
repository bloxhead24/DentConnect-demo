import { TreatmentType } from "@/lib/types";
import { TreatmentCard } from "@/components/TreatmentCard";
import { Button } from "@/components/ui/button";

interface TreatmentSelectionProps {
  onTreatmentSelect: (treatment: TreatmentType) => void;
  selectedTreatment: TreatmentType | null;
}

const treatmentTypes: TreatmentType[] = [
  {
    id: "emergency",
    name: "Emergency",
    category: "emergency",
    description: "Severe pain, trauma",
    icon: "fas fa-exclamation",
    color: "red",
  },
  {
    id: "urgent",
    name: "Urgent",
    category: "urgent", 
    description: "Filling, extraction",
    icon: "fas fa-clock",
    color: "orange",
  },
  {
    id: "routine",
    name: "Routine",
    category: "routine",
    description: "Cleaning, check-up",
    icon: "fas fa-calendar-check",
    color: "green",
  },
  {
    id: "cosmetic",
    name: "Cosmetic",
    category: "cosmetic",
    description: "Whitening, veneers",
    icon: "fas fa-smile",
    color: "blue",
  },
];

export default function TreatmentSelection({ onTreatmentSelect, selectedTreatment }: TreatmentSelectionProps) {
  return (
    <div className="onboarding-step active">
      <div className="px-4 py-8 space-y-6">
        {/* Welcome Message with Enhanced Design */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <i className="fas fa-tooth text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">How can we help you today?</h2>
          <p className="text-gray-600 text-lg">Find the perfect dental appointment based on your needs</p>
        </div>

        {/* Treatment Type Selection with Enhanced Grid */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center">What type of treatment do you need?</h3>
          <div className="grid grid-cols-2 gap-4">
            {treatmentTypes.map((treatment, index) => (
              <div 
                key={treatment.id}
                className="animate-in fade-in-50 slide-in-from-bottom-8 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TreatmentCard
                  treatment={treatment}
                  selected={selectedTreatment?.id === treatment.id}
                  onSelect={onTreatmentSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Button 
            className="floating-button w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-medium shadow-gentle"
            onClick={() => selectedTreatment && onTreatmentSelect(selectedTreatment)}
            disabled={!selectedTreatment}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
