import { useState } from "react";
import { AccessibilityNeed } from "@/lib/types";
import { AccessibilityOption } from "@/components/AccessibilityOption";
import { Button } from "@/components/ui/button";

interface AccessibilityFormProps {
  onComplete: (needs: AccessibilityNeed[]) => void;
  onBack: () => void;
  selectedNeeds: AccessibilityNeed[];
}

const accessibilityNeeds: AccessibilityNeed[] = [
  {
    id: "wheelchair",
    name: "Wheelchair Access",
    description: "Ramp access and accessible facilities",
    icon: "fas fa-wheelchair",
  },
  {
    id: "signLanguage",
    name: "Sign Language",
    description: "BSL interpreter available",
    icon: "fas fa-sign-language",
  },
  {
    id: "visualSupport",
    name: "Visual Support",
    description: "Large print and audio assistance",
    icon: "fas fa-eye",
  },
  {
    id: "cognitiveSupport",
    name: "Cognitive Support",
    description: "Extra time and clear explanations",
    icon: "fas fa-brain",
  },
];

export default function AccessibilityForm({ onComplete, onBack, selectedNeeds }: AccessibilityFormProps) {
  const [localSelectedNeeds, setLocalSelectedNeeds] = useState<AccessibilityNeed[]>(selectedNeeds);

  const handleToggleNeed = (need: AccessibilityNeed) => {
    setLocalSelectedNeeds(prev => {
      const isSelected = prev.some(n => n.id === need.id);
      if (isSelected) {
        return prev.filter(n => n.id !== need.id);
      } else {
        return [...prev, need];
      }
    });
  };

  const handleContinue = () => {
    onComplete(localSelectedNeeds);
  };

  return (
    <div className="onboarding-step active">
      <div className="px-4 py-8 space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">Any accessibility needs?</h2>
          <p className="text-text-soft">We want to ensure you have the best possible experience</p>
        </div>

        {/* Accessibility Options */}
        <div className="space-y-3">
          {accessibilityNeeds.map((need) => (
            <AccessibilityOption
              key={need.id}
              need={need}
              selected={localSelectedNeeds.some(n => n.id === need.id)}
              onToggle={handleToggleNeed}
            />
          ))}
        </div>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1 py-4 rounded-2xl" 
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-medium shadow-gentle"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
