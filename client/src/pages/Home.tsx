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
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <DentConnectLogo width={180} height={36} className="drop-shadow-sm" />
            </div>
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
              
              {/* Enhanced Early Access Button with Importance Highlighting */}
              <Button 
                onClick={() => window.location.href = "/early-access"}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
                size="sm"
              >
                <i className="fas fa-rocket mr-2"></i>
                Get Early Access
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
          
          {/* Royal College of Surgeons Badge */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-award text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    🏆 Nominated for Innovation Award
                  </p>
                  <p className="text-xs text-blue-600">
                    Royal College of Surgeons - Digital Health Excellence 2024
                  </p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
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
