import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { TreatmentType, AccessibilityNeed } from "../lib/types";
import { EarlyAccessPopup } from "../components/EarlyAccessPopup";

type SearchMode = "open" | "practice" | "mydentist";

interface SearchModeSelectionProps {
  selectedTreatment: TreatmentType | null;
  selectedAccessibility: AccessibilityNeed[];
  selectedBudget?: any;
  onSearchModeSelect: (mode: SearchMode) => void;
  onBack: () => void;
}

export default function SearchModeSelection({ 
  selectedTreatment, 
  selectedAccessibility,
  selectedBudget,
  onSearchModeSelect, 
  onBack 
}: SearchModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<SearchMode | null>(null);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  const searchModeOptions = [
    {
      id: "open" as SearchMode,
      title: "Open Search",
      subtitle: "Fastest appointment booking",
      description: "Matches you with any available dentist at the quickest possible time. Perfect for urgent care when speed matters most.",
      icon: "fas fa-bolt",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      borderColor: "border-orange-200",
      features: [
        "Fastest appointment times",
        "Any qualified emergency dentist",
        "Real-time availability",
        "Instant booking confirmation"
      ],
      recommended: selectedTreatment?.category === "emergency"
    },
    {
      id: "practice" as SearchMode,
      title: "My Practice Search",
      subtitle: "Familiar environment",
      description: "Matches you with the earliest appointment from any dentist within your registered practice. Maintains continuity of care.",
      icon: "fas fa-building",
      color: "from-blue-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-teal-50",
      borderColor: "border-blue-200",
      features: [
        "Your familiar practice",
        "Access to your dental records",
        "Any dentist in your practice",
        "Continuity of care"
      ],
      recommended: false
    },
    {
      id: "mydentist" as SearchMode,
      title: "My Dentist Search",
      subtitle: "Personal care continuity",
      description: "Matches you with the earliest appointment from your own dentist's diary. Best for ongoing treatment continuity.",
      icon: "fas fa-user-md",
      color: "from-teal-500 to-green-500",
      bgColor: "bg-gradient-to-br from-teal-50 to-green-50",
      borderColor: "border-teal-200",
      features: [
        "Your personal dentist only",
        "Complete treatment history",
        "Personalized care approach",
        "Long-term relationship"
      ],
      recommended: selectedTreatment?.category === "routine"
    }
  ];

  const handleModeSelect = (mode: SearchMode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      onSearchModeSelect(selectedMode);
      // Show early access popup after mode selection
      setTimeout(() => setShowEarlyAccess(true), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white hover:bg-gray-50"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </Button>
        <Badge className="bg-teal-600 text-white">
          Step 3 of 4
        </Badge>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Search Method</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Select how you'd like to find your emergency dental appointment. Each option offers different benefits for your situation.
        </p>
        
        {selectedTreatment && (
          <div className="mt-4 inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <div className={cn("w-3 h-3 rounded-full", selectedTreatment.color)}></div>
            <span className="text-sm font-medium text-gray-700">{selectedTreatment.name}</span>
          </div>
        )}
      </div>

      {/* Search Mode Options */}
      <div className="max-w-4xl mx-auto space-y-4 mb-8">
        {searchModeOptions.map((option) => (
          <Card 
            key={option.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              option.id === "open" ? "cursor-not-allowed opacity-75" : "cursor-pointer",
              selectedMode === option.id
                ? "ring-2 ring-teal-500 shadow-lg scale-[1.02]"
                : option.id === "open" ? "" : "hover:shadow-md hover:scale-[1.01]",
              option.bgColor,
              option.borderColor
            )}
            onClick={() => option.id !== "open" && handleModeSelect(option.id)}
          >
            {option.recommended && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-600 text-white shadow-lg">
                  <i className="fas fa-star mr-1"></i>
                  Recommended
                </Badge>
              </div>
            )}
            
            {/* Coming Soon Overlay for Open Search */}
            {option.id === "open" && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="bg-white rounded-lg p-6 text-center shadow-xl">
                  <div className="text-4xl mb-3">🚧</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-gray-600 text-sm">
                    Open search is being enhanced with<br />
                    advanced AI matching capabilities
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  option.color
                )}>
                  <i className={cn(option.icon, "text-2xl text-white")}></i>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{option.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {option.subtitle}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-600 text-sm"></i>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                <div className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedMode === option.id
                      ? "border-teal-500 bg-teal-500"
                      : "border-gray-300"
                  )}>
                    {selectedMode === option.id && (
                      <i className="fas fa-check text-white text-sm"></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="max-w-md mx-auto">
        <Button
          onClick={handleContinue}
          disabled={!selectedMode}
          className={cn(
            "w-full py-6 text-lg font-semibold transition-all",
            selectedMode
              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {selectedMode ? (
            <>
              <i className="fas fa-map-marked-alt mr-2"></i>
              Continue to Map Search
            </>
          ) : (
            "Select a search method to continue"
          )}
        </Button>
        
        {selectedMode && (
          <p className="text-center text-sm text-gray-600 mt-3">
            You selected: <span className="font-medium">{searchModeOptions.find(opt => opt.id === selectedMode)?.title}</span>
          </p>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center mt-8 max-w-lg mx-auto">
        <p className="text-sm text-gray-500">
          Not sure which option to choose? Open Search is recommended for urgent situations, 
          while My Practice or My Dentist are better for routine appointments.
        </p>
      </div>
      
      {/* Early Access Popup */}
      <EarlyAccessPopup 
        isOpen={showEarlyAccess}
        onClose={() => setShowEarlyAccess(false)}
        trigger="mode-selected"
        title="Mode Selected! 🎯"
        description="You've chosen your search approach. Experience the full platform with early access."
      />
    </div>
  );
}