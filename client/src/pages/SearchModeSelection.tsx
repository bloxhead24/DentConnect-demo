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

  const primaryOptions = [
    {
      id: "practice" as SearchMode,
      title: "My Practice",
      subtitle: "Any dentist at your practice",
      description: "Connect with any available dentist at your registered practice. Access your dental records and maintain continuity of care within your familiar environment.",
      icon: "fas fa-building",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      features: [
        "Your familiar practice",
        "Access to your dental records", 
        "Any available dentist",
        "Continuity of care"
      ],
      visual: "👥", // Multiple dentists
      recommended: false
    },
    {
      id: "mydentist" as SearchMode,
      title: "My Dentist",
      subtitle: "Your personal dentist only",
      description: "Connect specifically with your personal dentist. Ensures complete care history and maintains your trusted personal relationship.",
      icon: "fas fa-user-md",
      color: "from-teal-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-teal-50 to-emerald-50",
      borderColor: "border-teal-200",
      features: [
        "Your personal dentist only",
        "Complete care history",
        "Trusted relationship", 
        "Personalized treatment"
      ],
      visual: "👨‍⚕️", // Single dentist
      recommended: selectedTreatment?.category === "routine"
    }
  ];

  const secondaryOption = {
    id: "open" as SearchMode,
    title: "Open Search",
    subtitle: "Any dentist, fastest time",
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
    visual: "⚡",
    recommended: selectedTreatment?.category === "emergency"
  };

  const handleModeSelect = (mode: SearchMode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      onSearchModeSelect(selectedMode);
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

      {/* Primary Options - Side by Side */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {primaryOptions.map((option) => (
          <Card 
            key={option.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 cursor-pointer",
              selectedMode === option.id
                ? "ring-2 ring-teal-500 shadow-lg scale-[1.02]"
                : "hover:shadow-md hover:scale-[1.01]",
              option.bgColor,
              option.borderColor
            )}
            onClick={() => handleModeSelect(option.id)}
          >
            {option.recommended && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-600 text-white shadow-lg">
                  <i className="fas fa-star mr-1"></i>
                  Recommended
                </Badge>
              </div>
            )}
            
            <div className="p-6">
              {/* Visual and Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-r", option.color)}>
                  <span className="text-3xl">{option.visual}</span>
                </div>
                <i className={cn("text-3xl opacity-20", option.icon)}></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{option.subtitle}</p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{option.description}</p>
              
              <div className="space-y-2">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
        </div>

        {/* Secondary Option - Open Search at Bottom */}
        <div className="max-w-4xl mx-auto">
          <Card 
            className={cn(
              "relative overflow-hidden cursor-not-allowed opacity-75",
              secondaryOption.bgColor,
              secondaryOption.borderColor
            )}
          >
            {secondaryOption.recommended && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-600 text-white shadow-lg">
                  <i className="fas fa-star mr-1"></i>
                  Recommended
                </Badge>
              </div>
            )}
            
            {/* Coming Soon Overlay */}
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
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-r", secondaryOption.color)}>
                  <span className="text-3xl">{secondaryOption.visual}</span>
                </div>
                <i className={cn("text-3xl opacity-20", secondaryOption.icon)}></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{secondaryOption.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{secondaryOption.subtitle}</p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{secondaryOption.description}</p>
              
              <div className="grid grid-cols-2 gap-2">
                {secondaryOption.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
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
            You selected: <span className="font-medium">
              {[...primaryOptions, secondaryOption].find(opt => opt.id === selectedMode)?.title}
            </span>
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