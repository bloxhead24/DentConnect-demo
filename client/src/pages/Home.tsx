import { useState } from "react";
import TreatmentSelection from "./TreatmentSelection";
import AccessibilityForm from "./AccessibilityForm";
import MapView from "./MapView";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"treatment" | "accessibility" | "map">("treatment");
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);
  const [selectedAccessibility, setSelectedAccessibility] = useState<AccessibilityNeed[]>([]);

  const handleTreatmentSelect = (treatment: TreatmentType) => {
    setSelectedTreatment(treatment);
    setCurrentStep("accessibility");
  };

  const handleAccessibilityComplete = (needs: AccessibilityNeed[]) => {
    setSelectedAccessibility(needs);
    setCurrentStep("map");
  };

  const handleBack = () => {
    if (currentStep === "accessibility") {
      setCurrentStep("treatment");
    } else if (currentStep === "map") {
      setCurrentStep("accessibility");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--warm-white))' }}>
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-tooth text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">DentConnect</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
              <i className="fas fa-bell text-text-soft"></i>
            </button>
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
              <i className="fas fa-user text-text-soft"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {currentStep === "treatment" && (
          <TreatmentSelection 
            onTreatmentSelect={handleTreatmentSelect}
            selectedTreatment={selectedTreatment}
          />
        )}
        
        {currentStep === "accessibility" && (
          <AccessibilityForm 
            onComplete={handleAccessibilityComplete}
            onBack={handleBack}
            selectedNeeds={selectedAccessibility}
          />
        )}
        
        {currentStep === "map" && (
          <MapView 
            selectedTreatment={selectedTreatment}
            selectedAccessibility={selectedAccessibility}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
