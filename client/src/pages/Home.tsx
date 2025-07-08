import { useState } from "react";
import { TreatmentType, AccessibilityNeed } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TreatmentSelection from "./TreatmentSelection";
import AccessibilityForm from "./AccessibilityForm";
import MapView from "./MapView";
import DentConnectLogo from "@/components/DentConnectLogo";
import { Stethoscope, Users, MapPin, Clock, Shield, Star } from "lucide-react";

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
      setSelectedTreatment(null);
    } else if (currentStep === "map") {
      setCurrentStep("accessibility");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Enhanced Mobile-First Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-primary/10 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <DentConnectLogo width={180} height={36} className="drop-shadow-sm" />
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/dentist-signup"}
              className="text-primary hover:bg-primary/10 transition-all duration-300 hidden sm:flex"
            >
              <Stethoscope className="h-4 w-4 mr-1" />
              Dentists
            </Button>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/dentist-signup"}
                className="text-primary hover:bg-primary/10 transition-all duration-300 border-primary/20"
              >
                <Users className="h-4 w-4 mr-1" />
                Join as Dentist
              </Button>
              <div className="flex items-center space-x-1">
                <button className="p-2 rounded-xl hover:bg-primary/10 transition-all duration-300 group relative">
                  <i className="fas fa-bell text-gray-600 group-hover:text-primary text-sm"></i>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                </button>
                <button className="p-2 rounded-xl hover:bg-primary/10 transition-all duration-300 group">
                  <i className="fas fa-user text-gray-600 group-hover:text-primary text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Indicator for Mobile */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className={`flex items-center space-x-1 ${currentStep === "treatment" ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${currentStep === "treatment" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Treatment</span>
            </div>
            <div className={`flex items-center space-x-1 ${currentStep === "accessibility" ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${currentStep === "accessibility" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Preferences</span>
            </div>
            <div className={`flex items-center space-x-1 ${currentStep === "map" ? "text-primary font-medium" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${currentStep === "map" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span>Book</span>
            </div>
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
