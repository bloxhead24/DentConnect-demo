import { useState } from "react";
import { AccessibilityNeed } from "../lib/types";
import { AccessibilityOption } from "../components/AccessibilityOption";
import { Button } from "../components/ui/button";
import { EarlyAccessPopup } from "../components/EarlyAccessPopup";

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
  {
    id: "anxietySupport",
    name: "Anxiety Support",
    description: "Calming environment and sedation options",
    icon: "fas fa-spa",
  },
];

export default function AccessibilityForm({ onComplete, onBack, selectedNeeds }: AccessibilityFormProps) {
  const [localSelectedNeeds, setLocalSelectedNeeds] = useState<AccessibilityNeed[]>(selectedNeeds);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

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
    // Show early access popup after accessibility preferences completion
    setTimeout(() => setShowEarlyAccess(true), 1000);
  };

  return (
    <div className="onboarding-step active animate-in fade-in-50 slide-in-from-right-8 duration-500">
      <div className="mobile-padding tablet-padding desktop-padding py-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-secondary via-secondary/80 to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="mobile-header md:text-2xl font-bold text-gray-900 leading-tight">Your Care Preferences</h2>
          <p className="text-gray-600 mobile-text md:text-lg">We want to ensure you have the best possible experience</p>
        </div>

        {/* Accessibility Options - Mobile Optimized */}
        <div className="space-y-3">
          {accessibilityNeeds.map((need, index) => (
            <div 
              key={need.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <AccessibilityOption
                need={need}
                selected={localSelectedNeeds.some(n => n.id === need.id)}
                onToggle={handleToggleNeed}
              />
            </div>
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
      
      {/* Early Access Popup */}
      <EarlyAccessPopup 
        isOpen={showEarlyAccess}
        onClose={() => setShowEarlyAccess(false)}
        trigger="preferences-complete"
        title="Preferences Saved! ❤️"
        description="Your accessibility needs have been noted. Get early access for personalized dental care."
      />
    </div>
  );
}
